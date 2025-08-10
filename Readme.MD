# 🔐 TodoSvc-JWT

JWT 인증을 적용한 할일 관리 REST API 서비스

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0.2-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [인증 시스템](#-인증-시스템)
- [환경 변수](#-환경-변수)
- [개발자 가이드](#-개발자-가이드)
- [배포](#-배포)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🚀 프로젝트 소개

TodoSvc-JWT는 JWT(JSON Web Token) 인증을 구현한 할일 관리 REST API 서비스입니다. 사용자 등록, 로그인, 토큰 기반 인증, 할일 CRUD 기능을 제공합니다.

### ✨ 주요 특징

- **JWT 기반 인증**: Access Token + Refresh Token 구조
- **RESTful API**: 표준 REST API 설계
- **메모리 데이터베이스**: LokiJS를 활용한 빠른 데이터 처리
- **CORS 지원**: 크로스 오리진 요청 처리
- **로깅 시스템**: 접근 로그 자동 로테이션
- **웹 인터페이스**: API 테스트용 웹 페이지 제공

## 🎯 주요 기능

### 👤 사용자 관리
- 사용자 등록 (회원가입)
- 로그인 / 로그아웃
- JWT 토큰 갱신

### 📝 할일 관리
- 할일 목록 조회
- 할일 추가
- 할일 삭제

### 🔒 보안 기능
- JWT 기반 인증
- HMAC SHA-256 패스워드 해시
- CORS 정책 적용
- 캐시 방지 헤더 설정

## 🛠️ 기술 스택

### Backend
- **Node.js** 18+
- **Express.js** 4.21.2
- **JSON Web Token** 9.0.2
- **LokiJS** 1.5.12 (메모리 데이터베이스)

### Frontend
- **EJS** 3.1.10 (템플릿 엔진)
- **Bootstrap** 3.x
- **jQuery**
- **Font Awesome**

### Development
- **Babel** 7.26.0 (ES6+ 트랜스파일러)
- **Nodemon** 3.1.7 (개발 서버)

## 📁 프로젝트 구조

```
todosvc-jwt/
├── src/
│   ├── index.js      # 메인 서버 설정
│   ├── routes.js     # API 라우트 정의
│   ├── authutil.js   # JWT 인증 유틸리티
│   └── tododao.js    # 데이터 접근 계층
├── views/
│   └── index.ejs     # 메인 웹 페이지
├── public/           # 정적 파일 (CSS, JS, 이미지)
├── log/              # 접근 로그 파일
├── build/            # 빌드된 파일 (Babel 컴파일)
├── package.json      # 프로젝트 의존성
├── babel.config.json # Babel 설정
└── README.md         # 프로젝트 문서
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd todosvc-jwt
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
# 개발 모드 (nodemon + babel-node)
npm run start-dev

# 또는 프로덕션 모드
npm run build
npm start
```

### 4. 서버 접속
웹 브라우저에서 `http://localhost:3000` 접속

## 📚 API 문서

### Base URL
```
http://localhost:3000
```

### 🔓 인증 불필요 API

#### 1. 메인 페이지
```http
GET /
```

#### 2. 사용자 등록
```http
POST /users/create
Content-Type: application/json

{
  "userid": "testuser",
  "username": "테스트 사용자",
  "password": "1234"
}
```

**응답 예시:**
```json
{
  "status": "success",
  "message": "사용자 등록 성공!"
}
```

#### 3. 로그인
```http
POST /login
Content-Type: application/json

{
  "userid": "testuser",
  "password": "1234"
}
```

**응답 예시:**
```json
{
  "status": "success",
  "message": "로그인 성공",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. 토큰 갱신
```http
POST /token
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 🔐 인증 필요 API
모든 할일 관리 API는 Authorization 헤더가 필요합니다.

```http
Authorization: Bearer <access_token>
```

#### 1. 할일 목록 조회
```http
GET /todolist
Authorization: Bearer <access_token>
```

**응답 예시:**
```json
{
  "status": "success",
  "todoList": [
    {
      "userid": "testuser",
      "id": 1704107120576,
      "todo": "리액트 학습",
      "desc": "리액트 학습을 해야 합니다"
    }
  ]
}
```

#### 2. 할일 추가
```http
POST /todolist
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "todo": "새로운 할일",
  "desc": "할일에 대한 설명"
}
```

#### 3. 할일 삭제
```http
DELETE /todolist/:id
Authorization: Bearer <access_token>
```

## 🔒 인증 시스템

### JWT 토큰 구조
- **Access Token**: 1시간 만료, API 접근용
- **Refresh Token**: 7일 만료, 토큰 갱신용

### 토큰 페이로드 예시
```json
{
  "userid": "testuser",
  "role": "users",
  "iss": "jwt test server",
  "iat": 1640995200,
  "exp": 1641598000
}
```

### 기본 사용자 계정
| 사용자 ID | 비밀번호 | 역할 | 설명 |
|-----------|----------|------|------|
| `admin` | `1234` | `admins` | 관리자 |
| `gdhong` | `1234` | `users` | 일반 사용자 |
| `mrlee` | `1234` | `users` | 일반 사용자 |

## 🌍 환경 변수

### `.env` 파일 생성
```bash
# JWT 시크릿 키 (프로덕션에서는 반드시 변경)
JWT_SECRET_KEY=your-super-secret-key-here

# 서버 포트
PORT=3000

# CORS 허용 도메인
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 👨‍💻 개발자 가이드

### 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 시작 (자동 재시작)
npm run start-dev

# 빌드 (프로덕션용)
npm run build

# 빌드된 파일 실행
npm start
```

### 빌드 명령어
- `npm run clean`: 빌드 폴더 정리
- `npm run build-babel`: Babel 트랜스파일
- `npm run build`: 전체 빌드 (clean + build-babel)

### 코드 스타일
- ES6+ 문법 사용 (Babel 트랜스파일)
- 모듈화된 구조 (라우트, 인증, DAO 분리)
- 일관된 에러 응답 형식

## 🚀 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

### Docker 배포 (선택사항)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 기여하기

1. 포크 (Fork) 생성
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📝 라이선스  
MIT License  

