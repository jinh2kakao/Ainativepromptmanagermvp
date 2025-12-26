import sys
import os
from datetime import datetime
import uuid

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import User, Notice, FAQ, Inquiry, InquiryComment, InquiryStatus, UserRole, UserType, AiAgent, NoticeCreate, FAQCreate
from main import app

from fastapi.testclient import TestClient
client = TestClient(app)

def verify_community_features():
    print("Starting verification of Community Features...")
    
    with Session(engine) as session:
        # 1. Setup Admin and User
        admin_email = f"admin_test_{uuid.uuid4()}@example.com"
        user_email = f"user_test_{uuid.uuid4()}@example.com"
        
        admin = User(email=admin_email, role=UserRole.ADMIN, user_type=UserType.PRO)
        user = User(email=user_email, role=UserRole.USER, user_type=UserType.FREE)
        
        session.add(admin)
        session.add(user)
        session.commit()
        session.refresh(admin)
        session.refresh(user)
        
        print(f"Created Admin: {admin.id}, User: {user.id}")
        
        # Override dependencies for auth
        # In a real script we might need to mock get_current_user/admin.
        # For simplicity, we can use app.dependency_overrides
        
        from dependencies import get_current_user, get_current_admin
        
        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_current_admin] = lambda: admin
        
        # 2. Verify Notices (Admin)
        print("\n[Notice] Testing CRUD...")
        notice_data = {"title": "Test Notice", "content": "Content", "is_published": True}
        response = client.post("/api/admin/notices", json=notice_data)
        assert response.status_code == 200, f"Create Notice Failed: {response.text}"
        notice_id = response.json()["id"]
        print(f"Created Notice: {notice_id}")
        
        response = client.get("/api/notices") # Public
        assert response.status_code == 200
        assert len([n for n in response.json() if n["id"] == notice_id]) > 0
        print("Verified Public Notice List")
        
        # 3. Verify FAQ (Admin)
        print("\n[FAQ] Testing CRUD...")
        faq_data = {"category": "Test", "question": "Q?", "answer": "A", "display_order": 1}
        response = client.post("/api/admin/faqs", json=faq_data)
        assert response.status_code == 200, f"Create FAQ Failed: {response.text}"
        faq_id = response.json()["id"]
        print(f"Created FAQ: {faq_id}")
        
        response = client.get("/api/faqs")
        assert response.status_code == 200
        assert len([f for f in response.json() if f["id"] == faq_id]) > 0
        print("Verified Public FAQ List")
        
        # 4. Verify Inquiry (User -> Admin)
        print("\n[Inquiry] Testing Flow...")
        # User creates inquiry
        app.dependency_overrides[get_current_user] = lambda: user # Ensure User context
        inq_data = {"title": "Help!", "content": "I need help", "category": "General"}
        response = client.post("/api/inquiries", json=inq_data)
        assert response.status_code == 200, f"Create Inquiry Failed: {response.text}"
        inquiry_id = response.json()["id"]
        print(f"Created Inquiry: {inquiry_id}")
        
        # Admin lists inquiries
        app.dependency_overrides[get_current_user] = lambda: admin # Switch to Admin for admin endpoint? 
        # Actually admin endpoint uses get_current_admin which we overrode to admin. 
        # But get_current_user also used in shared dependencies? No, separate.
        
        response = client.get("/api/admin/inquiries")
        assert response.status_code == 200
        inquiries = response.json()
        target_inquiry = next((i for i in inquiries if i["id"] == inquiry_id), None)
        assert target_inquiry is not None
        assert target_inquiry["user_email"] == user_email
        print("Verified Admin Inquiry List (with User Email)")
        
        # Admin replies
        comment_data = {"content": "Here is help."}
        response = client.post(f"/api/inquiries/{inquiry_id}/comments", json=comment_data) # Admin uses same endpoint? 
        # Wait, create_comment uses get_current_user. If admin is also a User (which it is), it works.
        # Backend logic for is_staff_reply checks if user.role == ADMIN.
        assert response.status_code == 200
        comment = response.json()
        assert comment["is_staff_reply"] == True
        print("Verified Admin Reply (is_staff_reply=True)")
        
        # Admin updates status
        response = client.patch(f"/api/admin/inquiries/{inquiry_id}/status", params={"status": "ANSWERED"})
        assert response.status_code == 200
        
        # User checks status
        app.dependency_overrides[get_current_user] = lambda: user
        response = client.get(f"/api/inquiries/{inquiry_id}")
        assert response.json()["status"] == "ANSWERED"
        print("Verified Status Update")
        
        # 5. Agents
        print("\n[Agents] Listing...")
        response = client.get("/api/agents")
        assert response.status_code == 200
        print(f"Agents Found: {len(response.json())}")
        
        print("\nSUCCESS: All Community Features Verified.")
        
        # Cleanup (Optional, test DB usually reset or separate)
        
if __name__ == "__main__":
    verify_community_features()
