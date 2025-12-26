# 보안 조치 가이드: 퍼블릭 저장소 전환 (Security Remediation Guide)

**날짜:** 2025-12-22
**상태:** 중요(Critical) 보안 이슈 발견됨
**목표:** 보안 취약점을 제거하고 민감한 데이터 노출을 방지하여 `Ainativepromptmanagermvp` 프로젝트의 안전한 퍼블릭 전환을 준비합니다.

## 🚨 요약 (Executive Summary)
코드베이스 보안 분석 결과, 즉시 해결해야 할 **3개의 치명적(Critical) 위험**과 **1개의 주의(Moderate) 위험**이 식별되었습니다.
**이 단계들을 완료하기 전까지는 절대로 저장소를 퍼블릭(Public)으로 전환하지 마십시오.** 단순히 파일을 삭제하고 커밋하는 것만으로는 충분하지 않으며, **Git 히스토리**에 남아 있는 민감한 데이터를 완전히 제거해야 합니다.

---

## 🔍 주요 발견 사항 (Critical Findings)

### 1. Google OAuth 자격 증명 노출 (CRITICAL)
- **위치:** `backend/credentials.json`
- **문제:** 이 파일이 현재 Git으로 추적(Tracked)되고 있습니다. 파일 내에 `client_secret` ("GOCSPX-E8_0O...")을 포함한 중요 정보가 들어있습니다.
- **위험:** 퍼블릭 저장소의 히스토리를 통해 누구나 이 자격 증명을 탈취할 수 있으며, 이를 통해 애플리케이션을 사칭하거나 구글 API(Gmail 발송 등)를 무단 사용하여 금전적 피해를 입힐 수 있습니다.

### 2. 하드코딩된 백도어 토큰 (CRITICAL)
- **위치:** `backend/dependencies.py`
- **문제:** 19번째 줄에 `if token == "QA_ADMIN_TOKEN":` 코드가 존재합니다.
- **위험:** 이는 인증을 우회할 수 있는 만능 열쇠입니다. 공격자가 이 정적 문자열을 토큰으로 보내기만 하면 백엔드의 관리자 권한을 획득할 수 있습니다.

### 3. 인프라 정보 노출 (MODERATE)
- **위치:** `deploy_prod.sh`
- **문제:** AWS 계정 ID (`736817644725`)와 ECR URL이 스크립트에 하드코딩되어 있습니다.
- **위험:** 직접적인 액세스 키는 아니지만, 계정 ID 노출은 AWS 인프라에 대한 타겟팅 공격의 빌미가 될 수 있습니다.

### 4. Git 히스토리 오염 (CRITICAL)
- **문제:** `credentials.json`이 이미 커밋된 적이 있으므로, 현재 파일을 삭제하더라도 과거 커밋 기록에는 파일 내용이 그대로 남아 있습니다.
- **위험:** 봇(Bot)들은 퍼블릭 GitHub 저장소가 생성되는 즉시 이를 스캔합니다. 히스토리를 정리하지 않으면 키가 즉시 유출된 것으로 간주해야 합니다.

---

## 🛠️ 조치 계획 (단계별 가이드)

### 1단계: 코드 정화 (즉시 실행)

#### Step 1: 하드코딩된 백도어 제거
`backend/dependencies.py`에서 `QA_ADMIN_TOKEN` 비교 로직을 제거하거나, 프로덕션 환경에서는 작동하지 않도록 안전한 환경 변수로 대체해야 합니다.

#### Step 2: 인프라 설정 외부화
`deploy_prod.sh`에서 하드코딩된 ECR URL 등을 환경 변수로 변경합니다.

#### Step 3: 비밀 파일 추적 중단
로컬 디스크의 파일은 유지하면서, Git 추적에서만 제외하기 위해 아래 명령어를 실행합니다:
```powershell
git rm --cached backend/credentials.json
# 추적 중인 다른 민감 파일이 있다면 동일하게 처리
```

### 2단계: 히스토리 세탁 (필수)

**경고:** 이 작업은 파괴적입니다. 팀원 모두가 변경 사항을 푸시했는지 확인하고 작업을 중단하십시오.

파일을 Git 기록에서 완전히 삭제하려면 히스토리를 다시 써야 합니다. `git-filter-repo` (Python 기반) 또는 `BFG Repo-Cleaner` 사용을 권장합니다.

**`git filter-repo` 사용법 (권장):**
1. 설치: `pip install git-filter-repo`
2. **정리 실행:**
   ```powershell
   # 주의: 이 명령은 히스토리를 영구적으로 변경합니다!
   git filter-repo --path backend/credentials.json --invert-paths --force
   ```
3. **강제 푸시 (Force Push):**
   ```powershell
   git push origin main --force
   ```

### 3단계: 키 교체 (Key Rotation) - 매우 중요

`credentials.json`이 이미 Git에 올라갔으므로, 해당 키는 **이미 유출된 것으로 간주**하고 폐기해야 합니다.

1.  **Google Cloud Console 접속:**
    *   APIs & Services > Credentials 메뉴로 이동.
    *   기존 OAuth 2.0 Client ID를 **삭제**합니다.
    *   **새로운 Client ID**를 생성합니다.
    *   새로운 `credentials.json`을 다운로드합니다.
    *   **주의:** 다운로드한 새 파일은 절대 Git에 올리지 마십시오.

---

## ✅ Agent 지원 제안
제가 **1단계: 코드 정화 (Code Sanitization)** 작업을 즉시 도와드릴 수 있습니다:
1.  `backend/dependencies.py` 수정: 백도어 제거 또는 보안 강화.
2.  `deploy_prod.sh` 수정: 환경 변수 사용.
3.  `.gitignore` 점검 및 강화.

**지금 바로 코드 수정을 진행할까요?**
