# TodoSvc-JWT

JWT 인증을 적용한 할일 관리 REST API 서비스 (TypeScript)

## 소개

Express 기반으로 사용자 등록/로그인/JWT 인증(Access + Refresh Token)과 할일(Todo) CRUD를 제공하는 예제 서비스입니다. 데이터는 파일 기반 인메모리 DB인 LokiJS(`sample.db`)에 저장됩니다.

## 기술 스택

- **TypeScript** — 전체 소스 (`src/**/*.ts`)
- **Express** 5
- **jose** — JWT 서명/검증 (HS512)
- **body-parser** 2, **cookie-parser**, **cors**, **morgan**, **rotating-file-stream**
- **LokiJS** — 인메모리/파일 DB
- **EJS** — 템플릿 엔진 (테스트용 웹 페이지)
- **tsx** — 개발 서버 실행기
- **tsc** — 빌드(타입체크 + 트랜스파일)

## 프로젝트 구조

```
todosvc-jwt/
├── src/
│   ├── index.ts       # 서버 설정, 미들웨어, JWT 인증 검사
│   ├── routes.ts       # API 라우트
│   ├── authutil.ts     # JWT 발급/검증, 비밀번호 해시
│   ├── tododao.ts      # LokiJS 데이터 접근 계층
│   ├── types.ts        # 공용 타입 정의
│   └── express.d.ts     # Express Request 타입 확장
├── views/               # EJS 템플릿
├── public/              # 정적 파일
├── log/                 # 접근 로그 (자동 생성)
├── build/               # 빌드 결과물 (tsc 컴파일)
└── tsconfig.json
```

## 설치 및 실행

```bash
npm install

# 개발 모드 (tsx + nodemon, 파일 변경 시 자동 재시작)
npm run dev

# 타입 체크만
npm run typecheck

# 빌드 후 실행 (build는 clean + tsc를 포함)
npm start
```

기본 포트는 `3000`이며 `PORT` 환경 변수로 변경할 수 있습니다.

## API

### 인증 불필요

| Method | URL | 설명 |
|---|---|---|
| GET | `/` | 테스트용 웹 페이지 |
| POST | `/users/create` | 사용자 등록 (`userid`, `password`, `username`) |
| POST | `/login` | 로그인 (`userid`, `password`) → access_token, refresh_token 발급 |
| POST | `/token` | refresh_token으로 토큰 갱신 (body 또는 `refresh_token` 쿠키) |

### 인증 필요 (`Authorization: Bearer <access_token>`)

| Method | URL | 설명 |
|---|---|---|
| GET | `/todolist` | 내 할일 목록 조회 |
| POST | `/todolist` | 할일 추가 (`todo`, `desc`) |
| DELETE | `/todolist/:id` | 할일 삭제 |

### 응답 형식과 HTTP Status Code

모든 API는 JSON으로 응답하며 body의 `status`는 `success` 또는 `fail`입니다. 결과는 HTTP Status Code로도 구분합니다.

```json
{ "status": "fail", "message": "로그인 실패 : 사용자, 암호를 확인하세요" }
```

| Method | URL | 성공 | 실패 |
|---|---|---|---|
| POST | `/users/create` | 201 | 400 필수 항목 누락, 409 이미 존재하는 사용자 |
| POST | `/login` | 200 | 400 필수 항목 누락, 401 사용자 또는 암호 불일치 |
| POST | `/token` | 200 | 400 refresh_token 누락, 401 유효하지 않거나 만료된 토큰, refresh_token이 아닌 토큰(access_token) |
| GET | `/todolist` | 200 | 401 인증 실패 |
| POST | `/todolist` | 201 | 400 `todo` 누락, 401 인증 실패 |
| DELETE | `/todolist/:id` | 200 | 400 `id`가 정수가 아님, 401 인증 실패, 404 삭제할 항목 없음 |

공통 응답:

- **400** — 요청 body가 올바른 JSON이 아님
- **401** — 인증이 필요한 API에서 `Authorization` 헤더 누락, Bearer 형식 아님, 토큰 위조·만료, refresh_token 사용. `WWW-Authenticate: Bearer` 헤더가 함께 전달됩니다.
- **404** — 존재하지 않는 URI (모든 Method)
- **500** — 내부 서버 오류

## 인증 방식

- 서명 알고리즘: **HS512**
- Access Token: 1시간 만료
- Refresh Token: 7일 만료, HTTP-only 쿠키 또는 요청 body로 전달 가능
- `/token`은 refresh_token만 허용하며, access_token으로는 토큰을 재발급할 수 없습니다
- 비밀번호는 SHA-256 HMAC으로 해시하여 저장

`JWT_SECRET_KEY` 환경 변수로 서명 키를 지정합니다. 지정하지 않으면 개발용 기본값을 사용하므로 운영 환경에서는 반드시 설정해야 합니다.

## 기본 계정 (샘플 데이터)

| userid | password | role |
|---|---|---|
| admin | 1234 | admins |
| gdhong | 1234 | users |
| mrlee | 1234 | users |
