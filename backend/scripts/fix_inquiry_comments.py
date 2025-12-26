from sqlmodel import Session, select
import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import InquiryComment, Inquiry

def fix_comments():
    with Session(engine) as session:
        # Find comments where is_staff_reply is True
        # Join with Inquiry to check owner
        statement = select(InquiryComment, Inquiry).where(
            InquiryComment.inquiry_id == Inquiry.id,
            InquiryComment.is_staff_reply == True,
            InquiryComment.author_id == Inquiry.user_id
        )
        
        results = session.exec(statement).all()
        
        count = 0
        for comment, inquiry in results:
            print(f"Fixing comment {comment.id}: Content='{comment.content}'")
            comment.is_staff_reply = False
            session.add(comment)
            count += 1
            
        if count > 0:
            session.commit()
            print(f"Successfully fixed {count} comments.")
        else:
            print("No incorrect comments found.")

if __name__ == "__main__":
    fix_comments()
