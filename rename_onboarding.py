import shutil
import os
import time

src = r"c:\Develops\techs\Ainativepromptmanagermvp\frontend\src\app\(onboarding)"
dst = r"c:\Develops\techs\Ainativepromptmanagermvp\frontend\src\app\onboarding"

def rename_dir():
    if not os.path.exists(src):
        print(f"Source {src} does not exist. Checking destination...")
        if os.path.exists(dst):
            print(f"Destination {dst} already exists. Upgrade success?")
            return True
        return False

    if os.path.exists(dst):
        print(f"Destination {dst} exists. merging/overwriting...")
        # shutil.copytree(src, dst, dirs_exist_ok=True)
        # shutil.rmtree(src)
        # return True
        # For safety, let's fail if dst exists to avoid partial states unless forced
        pass

    try:
        shutil.move(src, dst)
        print("Successfully renamed directory via shutil.move")
        return True
    except PermissionError:
        print("Permission denied. Trying copy + remove strategy with retries...")
        try:
            shutil.copytree(src, dst, dirs_exist_ok=True)
            print("Copy successful.")
        except Exception as e:
            print(f"Copy failed: {e}")
            return False
        
        # Try to delete source
        for i in range(3):
            try:
                shutil.rmtree(src)
                print("Source removed.")
                return True
            except Exception as e:
                print(f"Remove failed (attempt {i+1}): {e}")
                time.sleep(1)
        return False
    except Exception as e:
        print(f"Rename failed: {e}")
        return False

if __name__ == "__main__":
    rename_dir()
