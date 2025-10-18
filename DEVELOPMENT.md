# 🛠️ 개발 가이드

## 프로젝트 구조 이해

### 디렉토리 구조

```
/src
├── /app                    # Next.js App Router
│   ├── /api               # API 라우트 (서버리스 함수)
│   ├── /components        # React 컴포넌트
│   ├── /[routes]          # 페이지 라우트
│   ├── layout.js          # 루트 레이아웃
│   ├── page.js            # 홈 페이지
│   └── globals.css        # 글로벌 스타일
├── /context               # React Context (전역 상태)
└── /firebase              # Firebase 설정
```

### 핵심 개념

#### 1. App Router (Next.js 14)
- `page.js`: 페이지 컴포넌트
- `layout.js`: 레이아웃 래퍼
- `route.js`: API 엔드포인트
- `[id]`: 동적 라우트

#### 2. 클라이언트 vs 서버 컴포넌트
- `'use client'`: 클라이언트 컴포넌트 (상태, 이벤트 핸들러)
- 기본값: 서버 컴포넌트 (API 키 접근 가능)

---

## 새 기능 추가하기

### 1. 새 페이지 추가

```javascript
// src/app/new-page/page.js
'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '../components/Navbar';

export default function NewPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">새 페이지</h1>
      </main>
    </div>
  );
}
```

네비게이션에 추가:
```javascript
// src/app/components/Navbar.jsx
<Link href="/new-page" className="...">
  새 메뉴
</Link>
```

### 2. 새 API 엔드포인트 추가

```javascript
// src/app/api/new-feature/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { data } = await request.json();
    
    // 비즈니스 로직
    const result = processData(data);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: '오류 발생' },
      { status: 500 }
    );
  }
}
```

클라이언트에서 호출:
```javascript
const response = await fetch('/api/new-feature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'value' })
});
const result = await response.json();
```

### 3. 새 UI 컴포넌트 추가

```javascript
// src/app/components/ui/NewComponent.jsx
export default function NewComponent({ prop1, prop2 }) {
  return (
    <div className="...">
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

사용:
```javascript
import NewComponent from './ui/NewComponent';

<NewComponent prop1="value" prop2={123} />
```

---

## Firebase 데이터베이스 작업

### 문서 생성

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

const docRef = await addDoc(collection(db, 'collectionName'), {
  field1: 'value1',
  field2: 'value2',
  createdAt: new Date().toISOString()
});

console.log('Document ID:', docRef.id);
```

### 문서 읽기

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

const docRef = doc(db, 'collectionName', 'documentId');
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log('Data:', docSnap.data());
}
```

### 문서 업데이트

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

const docRef = doc(db, 'collectionName', 'documentId');
await updateDoc(docRef, {
  field1: 'newValue'
});
```

### 쿼리

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

const q = query(
  collection(db, 'collectionName'),
  where('field1', '==', 'value1')
);

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

---

## LLM API 통합

### 기본 패턴

```javascript
const prompt = `Your clear instruction here...`;

const llmResponse = await fetch(process.env.LLM_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LLM_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await llmResponse.json();
const content = data.choices[0].message.content;
```

### JSON 응답 파싱

```javascript
// LLM에게 JSON만 반환하도록 요청
const prompt = `... Provide ONLY the JSON object, no additional text.`;

const content = data.choices[0].message.content;
const jsonMatch = content.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  const result = JSON.parse(jsonMatch[0]);
}
```

### 다른 LLM 제공자 사용

#### Anthropic Claude
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.LLM_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })
});
```

#### Google Gemini
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.LLM_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  }
);
```

---

## 스타일링

### Tailwind CSS 클래스

프로젝트에서 정의된 커스텀 클래스:

```css
/* globals.css */
.btn-primary      /* 기본 버튼 */
.btn-secondary    /* 보조 버튼 */
.input-field      /* 입력 필드 */
.card             /* 카드 컨테이너 */
```

### 새 스타일 추가

```css
/* src/app/globals.css */
@layer components {
  .custom-class {
    @apply bg-blue-500 text-white p-4 rounded-lg;
  }
}
```

---

## 상태 관리

### Context API 사용

```javascript
// src/context/NewContext.js
'use client';

import { createContext, useContext, useState } from 'react';

const NewContext = createContext({});

export const useNew = () => useContext(NewContext);

export const NewContextProvider = ({ children }) => {
  const [state, setState] = useState(null);
  
  return (
    <NewContext.Provider value={{ state, setState }}>
      {children}
    </NewContext.Provider>
  );
};
```

레이아웃에 추가:
```javascript
// src/app/layout.js
import { NewContextProvider } from '@/context/NewContext';

<NewContextProvider>
  {children}
</NewContextProvider>
```

---

## 테스팅

### 수동 테스트 체크리스트

- [ ] 회원가입/로그인
- [ ] 프로필 생성 및 수정
- [ ] 채용 공고 업로드 (PDF, 텍스트)
- [ ] 자기소개서 피드백
- [ ] 모의 면접 (음성/텍스트)
- [ ] 히스토리 조회
- [ ] 로그아웃

### 브라우저 테스트

- Chrome (권장)
- Firefox
- Safari
- Edge

### 반응형 테스트

- 모바일 (320px - 768px)
- 태블릿 (768px - 1024px)
- 데스크톱 (1024px+)

---

## 디버깅

### 클라이언트 디버깅

```javascript
console.log('Debug:', value);
console.error('Error:', error);
```

브라우저 개발자 도구 (F12) 활용

### 서버 디버깅

터미널에서 로그 확인:
```javascript
// API route
console.log('Server log:', data);
```

### Firebase 디버깅

```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// 오프라인 지원 및 디버깅
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Persistence error:', err);
  });
```

---

## 성능 최적화

### 1. 이미지 최적화

```javascript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // 중요한 이미지
/>
```

### 2. 동적 import

```javascript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>로딩 중...</p>,
  ssr: false // 클라이언트에서만 로드
});
```

### 3. React.memo

```javascript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* 렌더링 */}</div>;
});
```

### 4. Firebase 쿼리 최적화

```javascript
// 제한된 결과만 가져오기
const q = query(
  collection(db, 'feedbacks'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10) // 최근 10개만
);
```

---

## 보안 고려사항

### 1. API 키 보호

❌ 잘못된 예:
```javascript
const apiKey = 'sk-1234567890abcdef'; // 하드코딩 금지
```

✅ 올바른 예:
```javascript
const apiKey = process.env.LLM_API_KEY; // 환경 변수 사용
```

### 2. 사용자 입력 검증

```javascript
if (!email || !email.includes('@')) {
  return { error: '유효하지 않은 이메일' };
}

if (password.length < 6) {
  return { error: '비밀번호는 6자 이상' };
}
```

### 3. Firebase 규칙

FIREBASE_RULES.md 참고

---

## 일반적인 문제 해결

### "Module not found" 오류
```bash
npm install
# 또는
rm -rf node_modules package-lock.json
npm install
```

### Firebase 초기화 오류
- `.env.local` 파일 확인
- Firebase 설정값 재확인
- 서버 재시작 (`npm run dev`)

### API 응답 타임아웃
- LLM API 제한 확인
- 프롬프트 길이 줄이기
- `max_tokens` 값 조정

---

## 코드 스타일 가이드

### 네이밍 규칙

- 컴포넌트: PascalCase (`MyComponent.jsx`)
- 함수: camelCase (`handleSubmit`)
- 상수: UPPER_SNAKE_CASE (`API_KEY`)
- 파일: kebab-case (`my-page.js`)

### 파일 구조

```javascript
// 1. Imports
import { useState } from 'react';
import Component from './Component';

// 2. 컴포넌트
export default function MyComponent() {
  // 3. 상태
  const [state, setState] = useState(null);
  
  // 4. 함수
  const handleClick = () => {
    // ...
  };
  
  // 5. JSX
  return (
    <div>
      {/* 내용 */}
    </div>
  );
}
```

---

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Firebase 문서](https://firebase.google.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)

---

## 커뮤니티 & 지원

문제가 발생하면:
1. README.md 확인
2. SETUP_GUIDE.md 참고
3. GitHub Issues 검색
4. 새 이슈 생성

Happy coding! 🚀

