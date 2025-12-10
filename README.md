# Golf Club AI Platform V11 - Club Edition

## 1. 개요
이 시스템은 동호회(클럽) 중심으로 운영되는 골프 AI 레슨 플랫폼입니다.
개인이 아닌 동호회 단위로 크레딧을 충전하고 멤버들이 공유하여 사용합니다.

## 2. 설치 및 실행
```bash
# 의존성 설치
npm install

# 서버 실행
npm start
# 또는 개발 모드
npm run dev
```
브라우저에서 `http://localhost:3000` 접속.

## 3. 주요 기능 및 계정

### A. 시스템 관리자 (System Admin)
- 접속: `http://localhost:3000/admin.html`
- 비밀번호: **130824**
- 역할: 각 동호회에서 입금 후 요청한 크레딧 충전 요청을 승인합니다.

### B. 동호회 생성 및 운영 (Club Owner)
1. 메인(`index.html`)에서 회원가입 후 로그인.
2. `동호회 생성` 버튼 클릭하여 클럽 개설.
3. 획득한 **초대 코드**를 멤버들에게 공유.
4. 관리 메뉴(`Manager Mode`)에서 [월 패키지] 또는 [연 패키지] 선택 후 입금 요청.
5. 시스템 관리자가 승인하면 크레딧이 충전됨.

### C. 일반 멤버
1. 회원가입 후 `초대 코드` 입력하여 가입.
2. 스윙 영상 업로드 시 동호회 크레딧(공용)이 차감됨.
3. 게시판 및 리포트 열람 가능.

## 4. 입금 계좌 정보
- 은행: **카카오뱅크**
- 계좌: **7777-03-4553512**
- 예금주: **박두리**

## 5. 기술 스택
- Frontend: HTML5, TailwindCSS (CDN), Vanilla JS
- Backend: Node.js, Express
- Database: SQLite (`golf_club_v11.db` 파일로 자동 생성됨)
- PWA Support: Yes (Installable)
