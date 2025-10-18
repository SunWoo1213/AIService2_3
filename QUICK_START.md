# ⚡ 빠른 시작 (5분 가이드)

## 1️⃣ 설치 (1분)

```bash
cd AI_Service2_1
npm install
```

## 2️⃣ Firebase 설정 (2분)

1. https://console.firebase.google.com/ 접속
2. 새 프로젝트 생성
3. Authentication 활성화 (이메일/비밀번호)
4. Firestore Database 생성 (테스트 모드)
5. 웹 앱 추가 후 설정 정보 복사

## 3️⃣ 환경 변수 (1분)

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI (선택사항 - 없어도 작동)
LLM_API_KEY=sk-...
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

## 4️⃣ 실행 (1분)

```bash
npm run dev
```

브라우저: http://localhost:3000

## 5️⃣ 테스트

1. 회원가입
2. 프로필 설정
3. 자기소개서 첨삭
4. 모의 면접

## 🎉 완료!

더 자세한 내용:
- 📖 [README.md](README.md)
- 🚀 [SETUP_GUIDE.md](SETUP_GUIDE.md)
- 💻 [DEVELOPMENT.md](DEVELOPMENT.md)
- 🌐 [DEPLOYMENT.md](DEPLOYMENT.md)

