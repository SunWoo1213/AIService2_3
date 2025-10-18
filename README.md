# 🚀 AI Job Prep - AI 취업 준비 웹사이트

Next.js 14, Firebase, 그리고 LLM API를 활용한 스마트 취업 준비 플랫폼입니다.

## ✨ 주요 기능

### 1. 👤 사용자 인증 및 프로필 관리
- Firebase Authentication을 통한 이메일/비밀번호 로그인
- 사용자 프로필 관리 (나이, 성별, 희망 직무, 경력, 자격증)

### 2. 📄 채용 공고 분석
- PDF 파일 또는 텍스트 입력으로 채용 공고 분석
- AI가 핵심 키워드, 필수 역량, 주요 업무 자동 추출

### 3. 📝 자기소개서 첨삭
- 채용 공고 기반 자기소개서 분석
- 문장별 개선 제안 및 이유 제공
- 100점 만점 점수 평가

### 4. 🎤 AI 모의 면접
- 자기소개서 기반 맞춤형 면접 질문 생성
- 브라우저 음성 인식으로 답변 녹음
- 실시간 타이머 및 답변 평가
- 각 답변에 대한 상세 피드백

### 5. 📊 히스토리 관리
- 모든 피드백 기록 저장 및 조회
- 자기소개서/면접 피드백 분리 관리
- 상세 결과 페이지

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), React
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **LLM Integration**: OpenAI API (또는 다른 LLM)
- **PDF Processing**: pdfjs-dist

## 📦 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd AI_Service2_1
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (Email/Password 방식 사용)
3. Firestore Database 생성
4. 프로젝트 설정에서 웹 앱 추가 후 config 정보 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# LLM API Configuration (OpenAI 예시)
LLM_API_KEY=your_openai_api_key
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

### 4. Firestore 인덱스 설정

Firestore에서 다음 인덱스를 생성하세요:

**컬렉션**: `feedbacks`
- `userId` (Ascending) + `createdAt` (Descending)

또는 앱을 실행하면 Firebase가 자동으로 인덱스 생성 링크를 제공합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 6. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
/src
├── /app
│   ├── /api
│   │   ├── /job/analyze          # 채용 공고 분석 API
│   │   ├── /resume/feedback      # 자기소개서 피드백 API
│   │   └── /interview
│   │       ├── generate-questions # 면접 질문 생성 API
│   │       └── evaluate          # 답변 평가 API
│   ├── /components
│   │   ├── /ui                   # 재사용 가능한 UI 컴포넌트
│   │   ├── AuthForm.jsx          # 로그인/회원가입 폼
│   │   ├── Navbar.jsx            # 네비게이션 바
│   │   ├── ProfileForm.jsx       # 프로필 입력 폼
│   │   ├── JobUploader.jsx       # 채용 공고 업로드
│   │   ├── ResumeEditor.jsx      # 자기소개서 입력
│   │   ├── FeedbackDisplay.jsx   # 피드백 표시
│   │   ├── InterviewUI.jsx       # 모의 면접 인터페이스
│   │   └── HistoryList.jsx       # 히스토리 목록
│   ├── /dashboard                # 대시보드 페이지
│   ├── /profile                  # 프로필 페이지
│   ├── /new-feedback             # 새 피드백 페이지
│   ├── /feedback/[id]            # 피드백 상세 페이지
│   ├── /interview                # 모의 면접 페이지
│   ├── /history                  # 히스토리 페이지
│   ├── layout.js                 # 루트 레이아웃
│   ├── page.js                   # 랜딩/로그인 페이지
│   └── globals.css               # 글로벌 스타일
├── /context
│   └── AuthContext.js            # 인증 컨텍스트
└── /firebase
    └── config.js                 # Firebase 설정
```

## 🎯 주요 기능 사용법

### 1. 회원가입 및 로그인
1. 메인 페이지에서 이메일과 비밀번호로 회원가입
2. 로그인하면 자동으로 대시보드로 이동

### 2. 프로필 설정
1. 네비게이션 바에서 "프로필" 클릭
2. 개인 정보 입력 (더 정확한 AI 피드백을 위해 권장)

### 3. 자기소개서 첨삭받기
1. "새 피드백" 메뉴 클릭
2. 채용 공고를 PDF 업로드 또는 텍스트로 입력
3. AI가 분석한 키워드 확인
4. 자기소개서 작성 후 피드백 요청
5. 점수 및 상세 피드백 확인

### 4. 모의 면접
1. "모의 면접" 메뉴 클릭
2. 이전에 작성한 자기소개서 선택
3. AI가 생성한 면접 질문에 음성 또는 텍스트로 답변
4. 각 답변에 대한 실시간 평가 확인

### 5. 히스토리 조회
1. "히스토리" 메뉴에서 모든 활동 기록 확인
2. 자기소개서/면접 탭으로 분류된 피드백 조회
3. 각 항목 클릭하여 상세 결과 확인

## 🔧 LLM API 설정

### OpenAI API 사용 시

```env
LLM_API_KEY=sk-...your_key...
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

### 다른 LLM 사용 시

API 라우트 파일을 수정하여 다른 LLM 제공자의 API 형식에 맞게 조정하세요:
- `/src/app/api/job/analyze/route.js`
- `/src/app/api/resume/feedback/route.js`
- `/src/app/api/interview/generate-questions/route.js`
- `/src/app/api/interview/evaluate/route.js`

### LLM API 없이 테스트

LLM API 키가 설정되지 않은 경우, 샘플 응답을 반환하므로 API 없이도 기능 테스트가 가능합니다.

## 🌐 브라우저 호환성

- **권장 브라우저**: Google Chrome (음성 인식 기능을 위해)
- Chrome 외의 브라우저에서는 모의 면접의 음성 인식 기능이 제한될 수 있습니다.

## 📝 Firestore 데이터 구조

### users 컬렉션
```javascript
{
  age: number,
  gender: string,
  desiredJob: string,
  experience: string,
  certifications: string,
  updatedAt: timestamp
}
```

### feedbacks 컬렉션
```javascript
{
  userId: string,
  type: 'resume' | 'interview',
  jobKeywords: object,
  resumeText: string,
  userProfile: object,
  feedback: object,           // resume type
  interviewResults: array,    // interview type
  createdAt: timestamp
}
```

## 🚀 배포

### Vercel 배포 (권장)

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com) 계정 연결
3. 프로젝트 import 후 환경 변수 설정
4. 자동 배포

### 기타 플랫폼

- Netlify
- AWS Amplify
- Firebase Hosting

환경 변수를 각 플랫폼에 맞게 설정하세요.

## 🐛 문제 해결

### Firebase 인증 오류
- Firebase Console에서 Authentication이 활성화되어 있는지 확인
- 이메일/비밀번호 로그인 방식이 활성화되어 있는지 확인

### Firestore 쿼리 오류
- Firestore 인덱스가 생성되어 있는지 확인
- Firebase Console에서 제공하는 인덱스 생성 링크 클릭

### PDF 업로드 오류
- PDF 파일이 손상되지 않았는지 확인
- 텍스트 입력 방식으로 대체 가능

### 음성 인식 오류
- Chrome 브라우저 사용 확인
- 마이크 권한 허용 확인
- 대체로 텍스트 입력 가능

## 📄 라이선스

이 프로젝트는 교육 및 개인 프로젝트 용도로 자유롭게 사용할 수 있습니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 통해 연락해주세요.

---

**Made with ❤️ using Next.js, Firebase, and AI**

