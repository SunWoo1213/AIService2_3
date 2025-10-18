# 🚀 AI Job Prep - 빠른 시작 가이드

## 1️⃣ 필수 준비사항

- Node.js 18 이상
- npm 또는 yarn
- Firebase 계정
- OpenAI API 키 (선택사항, 없어도 테스트 가능)

## 2️⃣ Firebase 프로젝트 설정 (5분)

### Step 1: Firebase 프로젝트 생성

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: ai-job-prep)
4. Google Analytics 설정 (선택사항)

### Step 2: Authentication 설정

1. 좌측 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "이메일/비밀번호" 활성화
4. "저장" 클릭

### Step 3: Firestore Database 생성

1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (나중에 보안 규칙 변경 가능)
4. 위치 선택 (asia-northeast3 - Seoul 권장)

### Step 4: 웹 앱 추가 및 설정 정보 가져오기

1. 프로젝트 설정 (⚙️) → 프로젝트 설정
2. "내 앱" 섹션에서 웹 앱 추가 (</> 아이콘)
3. 앱 닉네임 입력 (예: web-app)
4. Firebase Hosting 설정 건너뛰기
5. **firebaseConfig 객체 복사**

```javascript
// 예시 (실제 값은 다름)
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 3️⃣ 프로젝트 설정 (2분)

### Step 1: 의존성 설치

```bash
cd AI_Service2_1
npm install
```

### Step 2: 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```env
# Firebase Configuration (위에서 복사한 값 붙여넣기)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# OpenAI API (선택사항 - 없어도 샘플 응답으로 작동)
LLM_API_KEY=sk-...
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

**중요**: LLM_API_KEY가 없어도 앱이 작동합니다! 샘플 응답을 반환하므로 기능 테스트가 가능합니다.

## 4️⃣ 실행 (1분)

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 5️⃣ 첫 사용 가이드

### 1. 회원가입
- 이메일과 비밀번호 입력 (테스트용: test@example.com)
- "회원가입" 버튼 클릭

### 2. 프로필 설정 (선택사항)
- 네비게이션 바 → "프로필"
- 기본 정보 입력 후 저장

### 3. 자기소개서 첨삭 테스트
1. "새 피드백" 클릭
2. 채용 공고 샘플 입력:
```
[채용공고]
프론트엔드 개발자 모집
- React, Next.js 경험 필수
- TypeScript 사용 가능자
- 3년 이상 실무 경험
- Git을 이용한 협업 경험
```
3. "채용 공고 분석하기" 클릭
4. 자기소개서 샘플 입력:
```
저는 3년차 프론트엔드 개발자입니다. React와 Next.js를 
활용한 다양한 프로젝트 경험이 있습니다.
```
5. "피드백 받기" 클릭
6. 결과 확인

### 4. 모의 면접 테스트
1. "모의 면접" 클릭
2. 이전에 작성한 자기소개서 선택
3. 질문 생성 후 답변 (음성 또는 텍스트)
4. 평가 확인

## 6️⃣ Firestore 인덱스 생성 (필요시)

앱 사용 중 다음 오류가 발생하면:
```
The query requires an index
```

1. 콘솔에 표시된 링크 클릭
2. 또는 Firebase Console → Firestore Database → 색인
3. "복합" 탭에서 다음 인덱스 수동 생성:

**컬렉션 ID**: `feedbacks`
- `userId` (오름차순)
- `createdAt` (내림차순)

인덱스 생성은 몇 분 소요될 수 있습니다.

## 7️⃣ 브라우저 권장사항

- **모의 면접 음성 인식**: Google Chrome 필수
- 다른 브라우저에서는 텍스트 입력만 가능

## 🔧 문제 해결

### Firebase 연결 오류
```
Firebase: Error (auth/invalid-api-key)
```
→ `.env.local` 파일의 Firebase 설정값 재확인

### 페이지 404 오류
```
Error: Cannot find module
```
→ `npm install` 재실행

### PDF 업로드 오류
→ 텍스트 입력 방식으로 대체 사용

### 음성 인식 안됨
→ Chrome 브라우저 사용 및 마이크 권한 허용

## 🎉 완료!

모든 설정이 완료되었습니다. AI Job Prep을 사용해보세요!

## 📚 추가 자료

- [Firebase 문서](https://firebase.google.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)

## 💡 팁

1. **개발 시**: LLM API 없이도 테스트 가능 (샘플 응답 제공)
2. **프로덕션**: 실제 OpenAI API 키 필요
3. **보안**: Firebase 보안 규칙을 프로덕션 환경에 맞게 수정
4. **비용**: OpenAI API 사용량 모니터링 권장

질문이 있으시면 README.md를 참고하시거나 이슈를 등록해주세요!

