import sqlite3

def migrate():
    # 데이터베이스 파일 경로 (필요시 수정)
    db_path = 'user_data.db' 
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 컬럼 추가 시도
        try:
            print("Adding terms_agreed column to user table...")
            cursor.execute("ALTER TABLE user ADD COLUMN terms_agreed BOOLEAN DEFAULT 0")
            print("Successfully added terms_agreed column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column terms_agreed already exists.")
            else:
                print(f"Error adding column: {e}")
                
        # 기존 데이터 처리 (기존 유저는 모두 동의한 것으로 간주할지, 아니면 False로 둘지)
        # 정책상 기존 유저는 동의한 것으로 처리 (서비스 이용 중이었으므로)
        print("Updating existing users to terms_agreed = 1...")
        cursor.execute("UPDATE user SET terms_agreed = 1 WHERE terms_agreed IS NULL OR terms_agreed = 0")
        
        conn.commit()
        conn.close()
        print("Migration completed successfully.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
