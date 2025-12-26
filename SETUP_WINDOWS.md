# Windows 10 Pro 협업을 위한 환경 설정 가이드

이 가이드는 Windows 10 Pro 환경에서 **Ainativepromptmanagermvp** 프로젝트를 실행하기 위한 설정 단계를 설명합니다.

## 1. 사전 준비 사항 (Prerequisites)

시작하기 전에, 다음 소프트웨어가 Windows에 설치되어 있는지 확인하세요:

*   **Git**: [Git for Windows 다운로드](https://git-scm.com/download/win)
    *   *권장:* 설치 중 "Use Git from the Windows Command Prompt" 옵션 선택.
*   **Python**: [Python 3.10+ 다운로드](https://www.python.org/downloads/)
    *   **중요:** 설치 중 "Add Python to PATH" 체크박스 선택 필수.
*   **Node.js**: [Node.js (LTS) 다운로드](https://nodejs.org/) (버전 18 이상 권장)
*   **Visual Studio Code**: [VS Code 다운로드](https://code.visualstudio.com/) (권장 에디터)

## 2. 파일 전달 및 설정 (중요)

보안상 저장소에 포함되지 않는 중요 설정 파일(API 키, 데이터베이스 정보 등)은 별도로 전달받아 설정해야 합니다.

### 단계 1: Mac(원본)에서 파일 준비
(이미 Mac에서 완료됨) 제공된 `prepare_transfer.sh` 스크립트를 통해 `transfer_files` 폴더가 생성되었습니다.

### 단계 2: Windows로 파일 이동 및 배치
1.  전달받은 `transfer_files` 폴더를 Windows PC로 복사합니다.
2.  아래 설명에 따라 각 파일을 올바른 위치로 이동하고 이름을 변경하세요. (역슬래시 `\` 주의)

    *   **Backend 환경 변수**:
        *   `transfer_files/backend.env` 파일의 이름을 `.env`로 변경합니다.
        *   이 파일을 `Ainativepromptmanagermvp\backend\` 폴더 안으로 이동합니다.
    
    *   **Frontend 환경 변수**:
        *   `transfer_files/frontend.env.local` 파일의 이름을 `.env.local`로 변경합니다.
        *   이 파일을 `Ainativepromptmanagermvp\frontend\` 폴더 안으로 이동합니다.

    *   **보안 키 (선택 사항)**:
        *   `ainative-key.pem` 등의 키 파일들이 있다면 프로젝트 최상위 폴더(`Ainativepromptmanagermvp\`)로 이동합니다.

## 3. 프로젝트 실행 설정

### 3.1 저장소 복제 (Clone)
PowerShell 또는 CMD(혹은 VS Code 터미널)를 열고 저장소를 복제합니다:
```powershell
git clone <repository_url>
cd Ainativepromptmanagermvp
```

### 3.2 백엔드 (Backend) 설정
1.  백엔드 폴더로 이동:
    ```powershell
    cd backend
    ```
2.  가상 환경 생성:
    ```powershell
    python -m venv venv
    ```
3.  가상 환경 활성화:
    *   **PowerShell:**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
        *(권한 오류 발생 시, `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 명령어를 먼저 실행하세요)*
    *   **CMD:**
        ```cmd
        venv\Scripts\activate.bat
        ```
4.  패키지 설치:
    ```powershell
    pip install -r requirements.txt
    ```
5.  백엔드 서버 실행:
    ```powershell
    uvicorn main:app --reload
    ```
    *   서버가 `http://localhost:8000`에서 실행됩니다.

### 3.3 프론트엔드 (Frontend) 설정
1.  **새로운** 터미널 창을 열고 프론트엔드 폴더로 이동:
    ```powershell
    cd frontend
    ```
2.  패키지 설치:
    ```powershell
    npm install
    ```
3.  개발 서버 실행:
    ```powershell
    npm run dev
    ```
    *   프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 4. 문제 해결 (Troubleshooting)

*   **데이터베이스 연결 오류**:
    *   `backend\.env` 파일의 `DATABASE_URL`이 올바른지 확인하세요. 
    *   Mac의 로컬 DB 주소(`localhost`)를 그대로 쓰면 Windows에서 접속이 안 될 수 있습니다. (Supabase 호스팅 버전을 사용 중이라면 문제없음)
*   **환경 변수 누락**:
    *   `.env`와 `.env.local` 파일이 각각프로젝트 루트가 아닌 `backend`와 `frontend` 폴더 **내부**에 정확히 위치했는지 확인하세요.
*   **스크립트 실행 권한 오류 (PowerShell)**:
    *   `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 를 실행하여 스크립트 실행 권한을 부여하세요.

## 5. 협업 워크플로우 (Collaboration)
*   작업 시작 전 항상 최신 변경 사항을 가져오세요: `git pull`.
*   새로운 패키지/라이브러리를 추가했다면:
    *   Backend: `pip freeze > requirements.txt` 실행하여 목록 갱신.
    *   Frontend: `npm install <package>` 시 자동으로 `package.json`이 갱신됨.
