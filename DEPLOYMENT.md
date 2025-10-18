# 🚀 배포 가이드

## Vercel 배포 (권장)

Vercel은 Next.js를 만든 회사의 호스팅 플랫폼으로, Next.js 앱 배포에 최적화되어 있습니다.

### 1단계: GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/ai-job-prep.git
git push -u origin main
```

### 2단계: Vercel 계정 생성

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 3단계: 프로젝트 Import

1. GitHub 저장소 선택
2. "Import" 클릭
3. Framework Preset: Next.js (자동 감지됨)

### 4단계: 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수들을 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value
LLM_API_KEY=your_value
LLM_API_URL=your_value
```

**팁**: `.env.local` 파일의 내용을 복사하면 편리합니다.

### 5단계: 배포

1. "Deploy" 클릭
2. 2-3분 후 배포 완료
3. 제공된 URL로 접속 (예: https://ai-job-prep.vercel.app)

### 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포:
- main 브랜치에 push → 프로덕션 배포
- 다른 브랜치에 push → 미리보기 배포

---

## Netlify 배포

### 1단계: Netlify 계정 생성

1. https://netlify.com 접속
2. GitHub 계정으로 로그인

### 2단계: 새 사이트 추가

1. "Add new site" → "Import an existing project"
2. GitHub 저장소 선택
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3단계: 환경 변수 설정

Site settings → Environment variables에서 Firebase 및 LLM API 키 추가

### 4단계: 배포

"Deploy site" 클릭 후 완료

---

## Firebase Hosting 배포

### 1단계: Firebase CLI 설치

```bash
npm install -g firebase-tools
firebase login
```

### 2단계: Firebase 초기화

```bash
firebase init hosting
```

선택사항:
- Public directory: `out`
- Configure as single-page app: Yes
- GitHub 자동 배포: 선택 사항

### 3단계: Next.js 정적 빌드

`next.config.js` 수정:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### 4단계: 빌드 및 배포

```bash
npm run build
firebase deploy
```

**주의**: Firebase Hosting은 정적 사이트만 지원하므로 API 라우트를 Cloud Functions로 이동해야 합니다.

---

## AWS Amplify 배포

### 1단계: AWS Amplify 콘솔 접속

1. https://console.aws.amazon.com/amplify
2. "New app" → "Host web app"

### 2단계: GitHub 연결

1. GitHub 저장소 선택
2. 브랜치 선택 (main)

### 3단계: 빌드 설정

자동으로 Next.js 감지됨. 환경 변수 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
... (모든 Firebase 및 LLM 변수)
```

### 4단계: 배포

"Save and deploy" 클릭

---

## 도메인 설정

### Vercel

1. Project Settings → Domains
2. 도메인 입력 (예: ai-job-prep.com)
3. DNS 레코드 추가 (Vercel이 안내)

### Netlify

1. Site settings → Domain management
2. "Add custom domain"
3. DNS 설정 업데이트

### Firebase Hosting

1. Firebase Console → Hosting
2. "도메인 추가"
3. 도메인 인증 및 DNS 설정

---

## SSL/HTTPS

모든 플랫폼에서 자동으로 무료 SSL 인증서 제공 (Let's Encrypt)

---

## 프로덕션 최적화

### 1. 환경 변수 보안

- API 키는 절대 클라이언트에 노출하지 말 것
- `NEXT_PUBLIC_` 접두사는 클라이언트에서 접근 가능
- LLM API 키는 서버 측에서만 사용

### 2. Firebase 보안 규칙

FIREBASE_RULES.md 참고하여 프로덕션 보안 규칙 적용

### 3. 성능 최적화

```javascript
// next.config.js
const nextConfig = {
  // 이미지 최적화
  images: {
    domains: ['your-domain.com'],
  },
  // 압축
  compress: true,
  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}
```

### 4. 모니터링

- Vercel Analytics 활성화
- Firebase Performance Monitoring 설정
- OpenAI API 사용량 모니터링

---

## 배포 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수 설정 완료
- [ ] Firebase 보안 규칙 프로덕션 모드로 변경
- [ ] API 키 보안 확인
- [ ] 빌드 테스트 완료 (`npm run build`)
- [ ] 모든 기능 테스트 완료
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 테스트
- [ ] 에러 핸들링 확인
- [ ] SEO 메타 태그 설정
- [ ] 404 페이지 커스터마이징 (선택)

---

## 롤백 방법

### Vercel
1. Deployments 탭
2. 이전 배포 버전 선택
3. "Promote to Production"

### Netlify
1. Deploys 탭
2. 이전 배포 선택
3. "Publish deploy"

### GitHub
```bash
git revert HEAD
git push
```

---

## 비용 예상

### 무료 티어 (월간)

**Vercel**
- 100GB 대역폭
- 무제한 배포
- 자동 SSL

**Firebase**
- 1GB 스토리지
- 10GB/월 데이터 전송
- 50K 읽기/20K 쓰기/일

**OpenAI API**
- 사용량에 따라 과금
- GPT-3.5-turbo: $0.002/1K tokens

### 예상 비용 (100명 사용자 기준)
- Vercel: $0 (무료 티어)
- Firebase: $0-5 (무료 티어 초과 시)
- OpenAI: $10-30 (사용량에 따라)

---

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 테스트
npm run build
npm start
```

### 환경 변수 미적용
- 환경 변수 재배포 필요
- Vercel/Netlify: 프로젝트 재배포

### API 라우트 오류
- 서버리스 함수 제한 확인 (10초 타임아웃)
- 로그 확인 (Vercel Functions, Netlify Functions)

더 많은 정보는 각 플랫폼의 공식 문서를 참고하세요!

