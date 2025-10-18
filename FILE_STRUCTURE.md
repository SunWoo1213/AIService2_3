# 📂 완전한 파일 구조

## 전체 프로젝트 트리

```
AI_Service2_1/
│
├── 📄 Configuration Files
│   ├── package.json                    # 프로젝트 의존성 및 스크립트
│   ├── next.config.js                  # Next.js 설정
│   ├── tailwind.config.js              # Tailwind CSS 설정
│   ├── postcss.config.js               # PostCSS 설정
│   └── .eslintrc.json                  # ESLint 설정
│
├── 📚 Documentation
│   ├── README.md                       # 메인 프로젝트 문서
│   ├── QUICK_START.md                  # 5분 빠른 시작 가이드
│   ├── SETUP_GUIDE.md                  # 상세 설치 가이드
│   ├── DEVELOPMENT.md                  # 개발 가이드
│   ├── DEPLOYMENT.md                   # 배포 가이드
│   ├── FIREBASE_RULES.md               # Firebase 보안 규칙
│   ├── PROJECT_SUMMARY.md              # 프로젝트 요약
│   └── FILE_STRUCTURE.md               # 이 파일
│
└── 📁 src/
    │
    ├── 🔥 firebase/
    │   └── config.js                   # Firebase 초기화 설정
    │
    ├── 🌐 context/
    │   └── AuthContext.js              # 전역 인증 상태 관리
    │
    └── 📱 app/
        │
        ├── layout.js                   # 루트 레이아웃 (AuthContextProvider)
        ├── page.js                     # 홈/로그인 페이지
        ├── globals.css                 # 글로벌 스타일 및 Tailwind
        │
        ├── 🎨 components/
        │   │
        │   ├── 🔐 Authentication
        │   │   ├── AuthForm.jsx        # 로그인/회원가입 폼
        │   │   └── Navbar.jsx          # 네비게이션 바
        │   │
        │   ├── 👤 Profile
        │   │   └── ProfileForm.jsx     # 사용자 프로필 입력 폼
        │   │
        │   ├── 📄 Job & Resume
        │   │   ├── JobUploader.jsx     # 채용 공고 업로드 (PDF/텍스트)
        │   │   ├── ResumeEditor.jsx    # 자기소개서 입력 에디터
        │   │   └── FeedbackDisplay.jsx # 피드백 결과 표시
        │   │
        │   ├── 🎤 Interview
        │   │   └── InterviewUI.jsx     # 모의 면접 인터페이스
        │   │
        │   ├── 📊 History
        │   │   └── HistoryList.jsx     # 피드백 히스토리 목록
        │   │
        │   └── 🧩 ui/ (재사용 가능한 UI 컴포넌트)
        │       ├── Button.jsx          # 버튼 (4가지 variant)
        │       ├── Input.jsx           # 입력 필드
        │       ├── Textarea.jsx        # 텍스트 영역
        │       ├── Card.jsx            # 카드 컨테이너
        │       ├── Modal.jsx           # 모달 다이얼로그
        │       └── Loading.jsx         # 로딩 스피너
        │
        ├── 🏠 dashboard/
        │   └── page.js                 # 대시보드 메인 페이지
        │
        ├── 👤 profile/
        │   └── page.js                 # 프로필 설정 페이지
        │
        ├── 📝 new-feedback/
        │   └── page.js                 # 새 자기소개서 첨삭 페이지
        │
        ├── 📄 feedback/
        │   └── [id]/
        │       └── page.js             # 피드백 상세 페이지 (동적 라우트)
        │
        ├── 🎤 interview/
        │   └── page.js                 # 모의 면접 페이지
        │
        ├── 📊 history/
        │   └── page.js                 # 피드백 히스토리 페이지
        │
        └── 🔌 api/ (Next.js API Routes)
            │
            ├── job/
            │   └── analyze/
            │       └── route.js        # POST: 채용 공고 분석 API
            │
            ├── resume/
            │   └── feedback/
            │       └── route.js        # POST: 자기소개서 피드백 API
            │
            └── interview/
                ├── generate-questions/
                │   └── route.js        # POST: 면접 질문 생성 API
                └── evaluate/
                    └── route.js        # POST: 면접 답변 평가 API
```

---

## 📊 파일 통계

### 소스 코드
- **총 파일**: 29개 (src 디렉토리)
- **컴포넌트**: 13개
- **페이지**: 7개
- **API 엔드포인트**: 4개

### 문서
- **가이드 문서**: 8개
- **설정 파일**: 5개

### 총계
- **전체 파일**: 42개 이상
- **예상 코드 라인**: 3,000+ 라인

---

## 🎯 주요 디렉토리 설명

### `/src/app/api/`
**서버리스 API 엔드포인트**
- LLM API 호출
- Firebase Firestore 데이터 저장
- 서버 측에서만 실행 (API 키 보안)

### `/src/app/components/`
**React 컴포넌트**
- 재사용 가능한 UI 컴포넌트
- 비즈니스 로직 컴포넌트
- 클라이언트 사이드 렌더링

### `/src/app/components/ui/`
**기본 UI 컴포넌트 라이브러리**
- 프로젝트 전반에 걸쳐 재사용
- 일관된 디자인 시스템
- Tailwind CSS 기반

### `/src/context/`
**전역 상태 관리**
- React Context API
- 인증 상태 공유
- 전역 데이터 접근

### `/src/firebase/`
**Firebase 설정**
- Firebase 초기화
- Auth 및 Firestore 인스턴스
- 환경 변수 사용

---

## 🔄 데이터 흐름

### 인증 흐름
```
AuthContext → 모든 페이지 → Firebase Auth
```

### API 호출 흐름
```
컴포넌트 → API Route → LLM API → Firestore → 컴포넌트
```

### 페이지 네비게이션
```
/ (로그인) → /dashboard → /new-feedback → /feedback/[id]
                ↓           ↓
            /profile    /interview → /history
```

---

## 📦 npm 패키지

### 프로덕션 의존성
```json
{
  "firebase": "^10.7.1",           // Firebase SDK
  "next": "14.0.4",                // Next.js 프레임워크
  "react": "^18.2.0",              // React 라이브러리
  "react-dom": "^18.2.0",          // React DOM
  "pdfjs-dist": "^3.11.174"        // PDF 처리
}
```

### 개발 의존성
```json
{
  "autoprefixer": "^10.4.16",      // CSS 벤더 프리픽스
  "eslint": "^8.56.0",             // 코드 린팅
  "eslint-config-next": "14.0.4",  // Next.js ESLint 설정
  "postcss": "^8.4.32",            // CSS 처리
  "tailwindcss": "^3.4.0"          // Tailwind CSS
}
```

---

## 🎨 스타일 구조

### Tailwind 설정
```
tailwind.config.js
  ↓
globals.css (@tailwind directives)
  ↓
@layer components (커스텀 클래스)
  ↓
UI 컴포넌트 (재사용)
```

### 커스텀 클래스
- `.btn-primary` - 기본 버튼
- `.btn-secondary` - 보조 버튼
- `.input-field` - 입력 필드
- `.card` - 카드 컨테이너

---

## 🔐 환경 변수 구조

### 클라이언트 사이드 (`NEXT_PUBLIC_*`)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 서버 사이드
```
LLM_API_KEY
LLM_API_URL
```

---

## 🗄️ Firestore 컬렉션 구조

### `users`
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

### `feedbacks`
```javascript
{
  userId: string,
  type: 'resume' | 'interview',
  jobKeywords: {
    keywords: string[],
    skills: string[],
    responsibilities: string[]
  },
  resumeText: string,
  userProfile: object,
  feedback: {              // if type === 'resume'
    score: number,
    feedback_details: array
  },
  interviewResults: [      // if type === 'interview'
    {
      question: string,
      userAnswer: string,
      score: number,
      feedback: string
    }
  ],
  createdAt: timestamp
}
```

---

## 🎯 페이지 라우트 매핑

| URL | 파일 경로 | 설명 |
|-----|----------|------|
| `/` | `app/page.js` | 로그인/랜딩 페이지 |
| `/dashboard` | `app/dashboard/page.js` | 대시보드 |
| `/profile` | `app/profile/page.js` | 프로필 설정 |
| `/new-feedback` | `app/new-feedback/page.js` | 자기소개서 첨삭 |
| `/feedback/[id]` | `app/feedback/[id]/page.js` | 피드백 상세 |
| `/interview` | `app/interview/page.js` | 모의 면접 |
| `/history` | `app/history/page.js` | 히스토리 |

---

## 🔌 API 엔드포인트 매핑

| 엔드포인트 | 메서드 | 파일 | 설명 |
|-----------|--------|------|------|
| `/api/job/analyze` | POST | `api/job/analyze/route.js` | 채용 공고 분석 |
| `/api/resume/feedback` | POST | `api/resume/feedback/route.js` | 자기소개서 피드백 |
| `/api/interview/generate-questions` | POST | `api/interview/generate-questions/route.js` | 면접 질문 생성 |
| `/api/interview/evaluate` | POST | `api/interview/evaluate/route.js` | 답변 평가 |

---

## 📱 컴포넌트 의존성 트리

```
App (layout.js)
└── AuthContextProvider
    ├── Navbar (모든 페이지)
    │   ├── Button
    │   └── Link (Next.js)
    │
    └── Pages
        ├── Home (page.js)
        │   └── AuthForm
        │       ├── Input
        │       └── Button
        │
        ├── Dashboard
        │   └── Card
        │       └── Button
        │
        ├── Profile
        │   └── ProfileForm
        │       ├── Input
        │       ├── Textarea
        │       └── Button
        │
        ├── NewFeedback
        │   ├── JobUploader
        │   │   ├── Textarea
        │   │   └── Button
        │   └── ResumeEditor
        │       ├── Textarea
        │       └── Button
        │
        ├── FeedbackDetail
        │   ├── FeedbackDisplay
        │   │   └── Card
        │   └── Button
        │
        ├── Interview
        │   ├── InterviewUI
        │   │   ├── Card
        │   │   ├── Button
        │   │   └── Textarea
        │   └── Card
        │
        └── History
            └── HistoryList
                └── Card
```

---

## 🚀 빌드 출력

```bash
npm run build
```

생성되는 디렉토리:
```
.next/                  # Next.js 빌드 출력
├── cache/             # 빌드 캐시
├── server/            # 서버 사이드 코드
├── static/            # 정적 에셋
└── standalone/        # 독립 실행 가능 앱 (선택)
```

---

## 🔍 파일 찾기 가이드

### 특정 기능 수정하기

**로그인 화면 수정**
→ `src/app/page.js`, `src/app/components/AuthForm.jsx`

**대시보드 수정**
→ `src/app/dashboard/page.js`

**자기소개서 첨삭 로직**
→ `src/app/api/resume/feedback/route.js`

**모의 면접 UI**
→ `src/app/components/InterviewUI.jsx`

**버튼 스타일 변경**
→ `src/app/components/ui/Button.jsx`

**글로벌 스타일**
→ `src/app/globals.css`

**Firebase 설정**
→ `src/firebase/config.js`

---

이 구조는 확장 가능하고 유지보수하기 쉽게 설계되었습니다! 🎉

