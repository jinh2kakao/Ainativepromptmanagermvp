# GitHub Actions 배포 설정 가이드 (Secrets Setup)

새로 생성된 자동 배포 워크플로우(`deploy-ec2.yml`)가 작동하려면, GitHub 저장소에 보안 키(Secrets)를 등록해야 합니다.

## 1. 설정 페이지 이동
1. GitHub 저장소로 이동합니다.
2. 상단 메뉴의 **Settings** (설정) 클릭.
3. 좌측 사이드바에서 **Secrets and variables** > **Actions** 클릭.
4. **New repository secret** 버튼 클릭.

## 2. 등록해야 할 Secrets 목록
다음 4가지 항목을 각각 추가해 주세요. (이름은 정확히 일치해야 합니다)

**AWS_ACCESS_KEY_ID**
**AWS_SECRET_ACCESS_KEY_ID**
**EC2_HOST**
**EC2_SSH_KEY**

## 3. 작동 확인
설정이 완료된 후, `backend` 폴더 내의 코드를 수정하고 `main` 브랜치에 Push하면 Actions 탭에서 배포가 자동으로 진행되는 것을 확인할 수 있습니다.
