# 🚀 WHITEHAT PROTOCOL - 배포 가이드

이 문서는 WHITEHAT PROTOCOL 게임을 무료로 온라인에 배포하는 방법을 안내합니다.

---

## 📌 배포 옵션

이 게임은 다음 플랫폼에서 **무료로** 배포할 수 있습니다:

1. **Render.com** (추천) - 가장 쉽고 무료
2. **Railway.app** - 좋은 대안
3. **Fly.io** - 고급 옵션

---

## 🎯 옵션 1: Render.com (추천)

### 장점
✅ 완전 무료
✅ 자동 HTTPS
✅ GitHub 연동 자동 배포
✅ Socket.io 완벽 지원
✅ 설정 간단

### 배포 단계

#### 1. GitHub에 코드 푸시 (완료됨)
```bash
# 이미 완료되었습니다!
git push -u origin claude/check-file-storage-XD92m
```

#### 2. Render 계정 생성
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

#### 3. 새 Web Service 생성
1. 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결
   - "Connect GitHub" 클릭
   - `qwerasdf` 저장소 선택
   - 브랜치: `claude/check-file-storage-XD92m` 선택

#### 4. 설정 입력
```
Name: whitehat-protocol
Environment: Node
Region: 가장 가까운 지역 (예: Singapore)
Branch: claude/check-file-storage-XD92m
Build Command: npm install
Start Command: npm start
```

#### 5. 무료 플랜 선택
- **Plan Type: Free**
- 무료 플랜 제한:
  - 512MB RAM
  - 활동 없으면 15분 후 슬립
  - 월 750시간 무료

#### 6. "Create Web Service" 클릭

#### 7. 배포 대기 (3-5분)
- 빌드 로그를 실시간으로 볼 수 있습니다
- "Live" 표시가 나타나면 완료!

#### 8. 게임 접속
```
https://whitehat-protocol.onrender.com
```

### 자동 배포 설정
- GitHub에 푸시하면 자동으로 재배포됩니다!
- `render.yaml` 파일이 설정을 자동 관리합니다

---

## 🚂 옵션 2: Railway.app

### 장점
✅ $5 무료 크레딧/월
✅ 매우 빠른 배포
✅ 깔끔한 UI
✅ 자동 스케일링

### 배포 단계

#### 1. Railway 가입
1. https://railway.app 접속
2. GitHub로 로그인

#### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `qwerasdf` 저장소 선택

#### 3. 환경 변수 설정 (자동)
Railway가 자동으로 감지합니다.

#### 4. 배포 완료!
```
https://whitehat-protocol.up.railway.app
```

---

## ✈️ 옵션 3: Fly.io

### 장점
✅ 전 세계 배포
✅ 빠른 성능
✅ 무료 티어

### 배포 단계

#### 1. Fly CLI 설치
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

#### 2. 로그인
```bash
fly auth login
```

#### 3. 앱 초기화
```bash
fly launch
```

#### 4. 배포
```bash
fly deploy
```

#### 5. 접속
```bash
fly open
```

---

## 🔧 배포 후 설정

### 환경 변수 (선택사항)
배포 플랫폼에서 다음 환경 변수를 설정할 수 있습니다:

```
NODE_ENV=production
PORT=3000
```

### HTTPS 자동 설정
모든 플랫폼이 자동으로 HTTPS를 제공합니다!

---

## 📱 배포 후 테스트

### 1. 접속 확인
브라우저로 배포된 URL 접속

### 2. 멀티플레이어 테스트
- 여러 탭을 열어서 테스트
- 다른 기기에서 접속 테스트
- 방 코드로 입장 테스트

### 3. 성능 확인
- Socket.io 연결 상태 확인
- 실시간 동기화 확인
- 로그 없는 에러 확인

---

## 🐛 문제 해결

### "Application failed to respond" 에러
**원인:** 포트 설정 문제
**해결:**
```javascript
// server.js에서 확인
const PORT = process.env.PORT || 3000;
```

### Socket.io 연결 실패
**원인:** CORS 또는 프로토콜 문제
**해결:** server.js에 추가
```javascript
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
```

### 15분 후 슬립 (Render 무료 플랜)
**원인:** 무료 플랜 제한
**해결:**
- 유료 플랜으로 업그레이드 ($7/월)
- 또는 UptimeRobot으로 주기적 ping

---

## 💰 비용 비교

| 플랫폼 | 무료 티어 | 유료 시작가 |
|--------|----------|------------|
| **Render** | 750시간/월 | $7/월 |
| **Railway** | $5 크레딧/월 | 사용량 기반 |
| **Fly.io** | 제한적 무료 | $1.94/월~ |
| **Heroku** | ❌ 없음 | $7/월 |

**추천:** Render 무료 플랜으로 시작!

---

## 🔒 보안 고려사항

### 1. 환경 변수
민감한 정보는 환경 변수로 관리:
```bash
# .env 파일 (Git에 커밋 안 함)
SESSION_SECRET=your-secret-here
```

### 2. Rate Limiting
과도한 요청 방지:
```javascript
// 향후 추가 권장
const rateLimit = require('express-rate-limit');
```

### 3. HTTPS 강제
배포 플랫폼이 자동으로 처리합니다.

---

## 📊 모니터링

### Render 대시보드
- CPU/메모리 사용량
- 배포 히스토리
- 로그 실시간 확인

### 로그 확인
```bash
# Render
렌더 대시보드 > Logs 탭

# Railway
railway logs

# Fly.io
fly logs
```

---

## 🎮 사용자에게 공유하기

배포가 완료되면:

```
🎮 WHITEHAT PROTOCOL이 온라인입니다!

🌐 URL: https://whitehat-protocol.onrender.com

👥 필요 인원: 8명 (2 화이트해커 + 6 모듈)

📱 모바일/태블릿 지원

⚠️ 교육용 보안 시뮬레이션 게임입니다
```

---

## 🚀 빠른 시작 (Render)

한 줄 요약:
```bash
1. render.com 가입
2. GitHub 저장소 연결
3. "Create Web Service" 클릭
4. 5분 대기
5. 완료!
```

---

## 📞 지원

배포 중 문제가 발생하면:
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Fly.io Docs: https://fly.io/docs

---

## ✅ 체크리스트

배포 전:
- [ ] package.json에 의존성 모두 포함
- [ ] PORT 환경 변수 사용
- [ ] .gitignore에 node_modules 포함
- [ ] GitHub에 코드 푸시

배포 후:
- [ ] URL 접속 확인
- [ ] 멀티플레이어 테스트
- [ ] 모바일 접속 테스트
- [ ] 로그 확인

---

**축하합니다! 🎉**

게임이 이제 전 세계 어디서나 플레이 가능합니다!

**다음 단계:**
1. 친구들에게 URL 공유
2. 8명 모아서 플레이
3. 피드백 수집
4. 게임 개선

**Made with 💚 for education and security awareness**
