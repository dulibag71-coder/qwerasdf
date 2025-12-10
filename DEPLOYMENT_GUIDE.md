# 🚀 배포 가이드 (Deployment Guide)

이 프로젝트는 **Node.js** + **SQLite** 기반입니다.
데이터베이스가 파일(`golf_club_v11.db`)로 저장되므로, **영구 저장소(Persistent Volume)**가 지원되는 호스팅을 사용해야 데이터가 사라지지 않습니다.

추천하는 두 가지 방법을 안내합니다.

---

## 추천 1: Fly.io (가장 추천)
SQLite를 위한 Volume 기능을 제공하며, 무료 티어도 넉넉합니다.

### 1. Fly CLI 설치
[Fly.io](https://fly.io) 가입 후 터미널에서 설치:
```bash
# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. 로그인 및 앱 생성
```bash
fly auth login
fly launch --no-deploy
# 질문에 따라 앱 이름 지정 (Region: Tokyo/Seoul 추천)
```

### 3. Volume 생성 (DB 저장용)
```bash
fly volumes create golf_data --size 1
```

### 4. fly.toml 설정 수정
생성된 `fly.toml` 파일을 열어 `[mounts]` 섹션을 추가합니다:
```toml
[mounts]
  source = "golf_data"
  destination = "/data"
```

### 5. 배포
```bash
fly deploy
```
성공하면 제공된 URL(예: `https://my-golf-club.fly.dev`)로 접속 가능합니다.

---

## 추천 2: AWS Lightsail / VPS (전통적 방식)
Ubuntu 서버를 하나 빌려서 직접 실행하는 방식입니다.

1. **Node.js 설치**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **코드 업로드**: Git Clone 또는 SFTP로 파일 전송.

3. **패키지 설치 및 실행**:
```bash
npm install
npm install pm2 -g
pm2 start server.js --name "golf-club"
```

---

## ⚠️ 주의사항 (Heroku / Vercel 사용 시)
Heroku, Vercel, Render(무료) 등은 서버가 재부팅될 때마다 **파일 시스템이 초기화**됩니다.
즉, **SQLite DB 파일이 삭제되어 회원가입 정보가 날아갑니다.**
이 서비스들을 쓰려면 `SQLite` 대신 `PostgreSQL`이나 `MySQL` 같은 외부 DB로 코드를 수정해야 합니다.
(현재 코드는 SQLite 전용이므로 Fly.io나 VPS를 권장합니다)
