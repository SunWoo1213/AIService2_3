# Firebase Security Rules

## Firestore Security Rules

프로덕션 환경에서는 다음과 같은 보안 규칙을 설정하는 것을 권장합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - 사용자는 자신의 문서만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Feedbacks collection - 사용자는 자신의 피드백만 읽고 쓸 수 있음
    match /feedbacks/{feedbackId} {
      allow read: if request.auth != null && 
                     (resource == null || resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

## 설정 방법

1. Firebase Console 접속
2. Firestore Database → 규칙 탭
3. 위 규칙 복사 후 붙여넣기
4. "게시" 클릭

## 테스트 모드 (개발용)

개발 중에는 다음과 같은 규칙을 사용할 수 있습니다 (보안 취약):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **주의**: 이 규칙은 개발 환경에서만 사용하고, 프로덕션에서는 반드시 위의 제한적인 규칙을 사용하세요.

## Firestore 인덱스

다음 복합 인덱스를 생성하세요:

### feedbacks 컬렉션

1. **인덱스 1**: 사용자별 피드백 정렬
   - 컬렉션 ID: `feedbacks`
   - 필드:
     - `userId` (오름차순)
     - `createdAt` (내림차순)

2. **인덱스 2**: 타입별 피드백 필터링
   - 컬렉션 ID: `feedbacks`
   - 필드:
     - `userId` (오름차순)
     - `type` (오름차순)
     - `createdAt` (내림차순)

### 인덱스 생성 방법

**자동 생성** (권장):
1. 앱을 실행하고 기능을 사용
2. 콘솔에 표시되는 인덱스 생성 링크 클릭
3. Firebase가 자동으로 필요한 인덱스 생성

**수동 생성**:
1. Firebase Console → Firestore Database → 색인
2. "복합" 탭에서 "색인 추가"
3. 위의 필드 구성 입력
4. "만들기" 클릭

인덱스 생성은 보통 1-5분 정도 소요됩니다.

## Storage Rules (향후 확장용)

만약 Firebase Storage를 사용하여 파일을 저장한다면:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 프로덕션 체크리스트

프로덕션 배포 전 확인사항:

- [ ] Firestore 보안 규칙 설정 완료
- [ ] 필요한 인덱스 모두 생성 완료
- [ ] Firebase Authentication 이메일 인증 활성화 (선택)
- [ ] API 키 환경 변수로 안전하게 관리
- [ ] Firebase 사용량 모니터링 설정
- [ ] 백업 정책 수립

