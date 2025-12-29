import os
from dotenv import load_dotenv
from supabase import create_client, Client

def check_supabase_user(email):
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Missing Supabase credentials")
        return

    supabase: Client = create_client(url, key)
    
    # List users (admin only)
    # Unfortunately supabase-py admin.list_users() might be needed.
    # checking via admin
    try:
        response = supabase.auth.admin.list_users()
        print(f"Debug: Response type: {type(response)}")
        
        # It might be a list of User objects?
        users = []
        if isinstance(response, list):
             users = response
        elif hasattr(response, 'users'):
             users = response.users
        else:
             print(f"Unknown response format: {response}")
             return

        found = False
        for user in users:
            if user.email == email:
                print(f"User FOUND in Supabase Auth: ID={user.id}, Email={user.email}, Created={user.created_at}")
                found = True
                
                # Option to delete
                print(f"Deleting user {email} from Supabase Auth...")
                try:
                    del_res = supabase.auth.admin.delete_user(user.id)
                    print(f"User deleted successfully: {del_res}")
                except Exception as e:
                    print(f"Failed to delete user: {e}")
                
                break
        
        if not found:
            print("User NOT found in Supabase Auth")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_supabase_user("jinh2@kakao.com")
