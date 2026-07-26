# TodoSvc-JWT

JWT 인증을 적용한 할일 관리 REST API 서비스

## 소개

Node.js + Express 기반으로 사용자 등록/로그인/JWT 인증(Access + Refresh Token)과 할일(Todo) CRUD를 제공하는 예제 서비스입니다. 데이터는 파일 기반 인메모리 DB인 LokiJS(`sample.db`)에 저장됩니다.

## 기술 스택

- **Express** 5
- **jose** — JWT 서명/검증 (HS512)
- **body-parser** 2
- **cookie-parser**, **cors**, **morgan**, **rotating-file-stream**
- **LokiJS** — 인메모리/파일 DB
- **EJS** — 템플릿 엔진 (테스트용 웹 페이지)
- **Babel** 7 — ES6+ 트랜스파일

## 프로젝트 구조

```
todosvc-jwt/
├── src/
│   ├── index.js      # 서버 설정, 미들웨어, JWT 인증 검사
│   ├── routes.js      # API 라우트
│   ├── authutil.js    # JWT 발급/검증, 비밀번호 해시
│   └── tododao.js     # LokiJS 데이터 접근 계층
├── views/              # EJS 템플릿
├── public/             # 정적 파일
├── log/                # 접근 로그 (자동 생성)
└── build/              # 빌드 결과물 (babel 컴파일)
```

## 설치 및 실행

```bash
npm install

# 개발 모드 (nodemon + babel-node)
npm run dev

# 프로덕션 빌드 후 실행
npm run build
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

## 인증 방식

- 서명 알고리즘: **HS512**
- Access Token: 1시간 만료
- Refresh Token: 7일 만료, HTTP-only 쿠키 또는 요청 body로 전달 가능
- 비밀번호는 SHA-256 HMAC으로 해시하여 저장

`JWT_SECRET_KEY` 환경 변수로 서명 키를 지정합니다. 지정하지 않으면 개발용 기본값을 사용하므로 운영 환경에서는 반드시 설정해야 합니다.

## 기본 계정 (샘플 데이터)

| userid | password | role |
|---|---|---|
| admin | 1234 | admins |
| gdhong | 1234 | users |
| mrlee | 1234 | users |
