# ▲ Vercel 배포 가이드 (Vercel Deployment Guide)

이 프로젝트는 **PostgreSQL** 데이터베이스를 사용하여 Vercel에 배포할 준비가 되었습니다.

## 1. Vercel 프로젝트 설정
Vercel은 람다(Serverless) 방식이므로, 파일 저장이 불가능합니다.
데이터베이스는 **Vercel Postgres (Storage)**를 사용해야 합니다.

### 단계 1: Vercel 가입 및 CLI 설치
```bash
npm install -g vercel
vercel login
```

### 단계 2: 배포 명령어 실행
프로젝트 폴더에서 아래 명령어를 입력하세요:
```bash
vercel
```
- 질문에는 모두 기본값(`Enter`)을 선택하면 됩니다.

## 2. 데이터베이스 연결 (필수)
배포가 완료되면 웹사이트가 작동하지 않을 수 있습니다 (DB 연결 실패).
Vercel 대시보드에서 DB를 연결해야 합니다.

1. [Vercel Dashboard](https://vercel.com/dashboard) 프로젝트로 이동.
2. 상단 탭 **Storage** 클릭 -> **Connect Store** -> **Classic Postgres** (또는 Vercel Postgres) 생성.
3. 생성 후 **Settings** -> **Environment Variables**에 가보면 `POSTGRES_URL` 등이 자동으로 추가되어 있을 것입니다.
4. **Redeploy**: 환경변수 적용을 위해 대시보드에서 **Deployments** 탭 -> 최신 배포 우측 점 3개 -> **Redeploy**를 누르세요.

## 3. 완료
이제 주소로 접속하면 PostgreSQL과 연결된 골프 웹이 정상 작동합니다! ⛳
