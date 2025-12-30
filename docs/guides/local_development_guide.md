# Local Development Guide (로컬 개발 가이드)

이 문서는 **Ainativepromptmanagermvp** 프로젝트의 로컬 개발 환경을 설정하고 서버를 구동하는 방법을 설명합니다.

## 1. 사전 준비 사항 (Prerequisites)

다음 도구들이 설치되어 있어야 합니다:

*   **Git**: 소스 코드 버전 관리 [다운로드](https://git-scm.com/)
*   **Python**: 3.10 이상 (Backend) [다운로드](https://www.python.org/)
    *   *설치 시 `Add Python to PATH` 옵션 필수 체크*
*   **Node.js**: 18.0.0 이상 (Frontend) [다운로드](https://nodejs.org/)
*   **VS Code**: 권장 코드 에디터 [다운로드](https://code.visualstudio.com/)

---

## 2. 프로젝트 설정 (Project Setup)

### 2.1 저장소 복제
터미널을 열고 프로젝트를 로컬에 복제합니다.

```bash
git clone <repository-url>
cd Ainativepromptmanagermvp
```

### 2.2 환경 변수 설정
보안상 `.env` 파일은 저장소에 포함되지 않습니다. 관리자로부터 전달받은 파일을 각 디렉토리에 위치시켜야 합니다.

*   **Backend**: `backend/.env`
*   **Frontend**: `frontend/.env.local`

---

## 3. 백엔드 구동 (Backend)

백엔드는 **FastAPI** 프레임워크를 사용합니다.

1.  **터미널을 열고 프로젝트 루트로 이동한 뒤, 백엔드 디렉토리로 진입합니다**:
    ```bash
    # 프로젝트 루트(Ainativepromptmanagermvp) 기준
    cd backend
    ```

2.  **가상 환경(Virtual/Venv) 생성 및 활성화**:
    *   *Windows (PowerShell)*:
        ```powershell
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        ```
    *   *Mac/Linux*:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **의존성 패키지 설치**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **서버 실행**:
    ```bash
    uvicorn main:app --reload
    ```
    *   서버 주소: `http://localhost:8000`
    *   API 문서: `http://localhost:8000/docs`

### 3.1 Antigravity IDE (Integrated Terminal) 팁
Antigravity IDE 내장 터미널을 사용할 경우 다음 순서로 실행하면 편리합니다:

1.  터미널을 엽니다 (`Terminal` 탭 확인).
2.  백엔드 폴더로 이동했는지 확인합니다:
    ```powershell
    cd backend
    ```
    *(프롬프트 경로가 `...\backend` 로 끝나는지 확인하세요)*
3.  PowerShell에서 가상환경 활성화가 안 될 경우:
    ```powershell
    # 권한 문제 발생 시 1회 실행
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    
    # 가상환경 활성화
    .\venv\Scripts\Activate.ps1
    ```
4.  활성화 확인: 줄 맨 앞에 `(venv)` 가 표시되어야 합니다.

---

## 4. 프론트엔드 구동 (Frontend)

프론트엔드는 **Next.js** 프레임워크를 사용합니다.

1.  **새 터미널**을 열고 **프로젝트 루트로 이동한 뒤, 프론트엔드 디렉토리로 진입합니다**:
    ```bash
    # 프로젝트 루트(Ainativepromptmanagermvp) 기준
    cd frontend
    ```

2.  **패키지 설치**:
    ```bash
    npm install
    ```

3.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```
    *   웹사이트 주소: `http://localhost:3000`

---

## 5. 문제 해결 (Troubleshooting)

### Q1. Python `venv` 활성화 시 권한 오류 (Windows)
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
위 명령어를 PowerShell에서 실행하여 스크립트 실행 권한을 허용하세요.

### Q2. 모듈을 찾을 수 없다는 오류 (ModuleNotFoundError)
가상 환경(`venv`)이 활성화되어 있는지 확인하세요. 터미널 프롬프트 앞에 `(venv)`가 표시되어야 합니다.

### Q3. 포트 충돌 (Port already in use)
이미 해당 포트(8000, 3000)를 사용하는 다른 프로세스가 있는지 확인하고 종료하세요.

---

## 6. 주요 명령어 요약

| 구분 | 명령어 | 설명 |
| :--- | :--- | :--- |
| **Backend** | `venv\Scripts\activate` | 가상환경 활성화 (Win) |
| | `pip install -r requirements.txt` | 패키지 설치 |
| | `uvicorn main:app --reload` | 서버 실행 |
| **Frontend** | `npm install` | 패키지 설치 |
| | `npm run dev` | 개발 서버 실행 |
