# Post Woman

Postman과 유사한 간단한 REST API 클라이언트

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS v4 + shadcn/ui
- **BaaS**: Supabase (인증, DB) - Phase 3
- **상태관리**: Zustand
- **에디터**: Monaco Editor

## 기능 로드맵

### Phase 1: 기본 REST 클라이언트
- [x] 프로젝트 초기 설정
- [ ] REST 요청/응답 기능 (GET, POST, PUT, DELETE, PATCH)
- [ ] URL, Headers, Params 설정
- [ ] JSON Body 에디터
- [ ] 응답 표시 (상태코드, 헤더, 바디, 소요시간)
- [ ] 로컬 저장 및 트리 관리 (Collection > Folder > Request)

### Phase 2: 동기적 다중 요청 & 워크플로우
- [ ] 요청 체인 (순차 실행)
- [ ] 워크플로우 빌더
- [ ] Input/Output 파라미터 매핑

### Phase 3: Supabase 연동
- [ ] 사용자 인증 (이메일, OAuth)
- [ ] 클라우드 저장 및 동기화

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── components/
│   ├── request/      # 요청 관련 컴포넌트
│   ├── tree/         # 트리뷰 컴포넌트
│   ├── workflow/     # 워크플로우 컴포넌트 (Phase 2)
│   └── ui/           # shadcn/ui 컴포넌트
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
└── lib/              # 라이브러리 설정
```

## 라이선스

MIT
