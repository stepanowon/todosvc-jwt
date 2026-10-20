import type { JWTPayload } from 'jose';

export interface TodoItem {
  userid: string;
  id: number;
  todo: string;
  desc: string;
}

export interface UserRecord {
  userid: string;
  password: string;
  username: string;
  role: string;
}

// code: 응답에 사용할 HTTP Status Code (응답 body에는 포함하지 않는다)
export type ApiResult =
  | { status: 'success'; code?: number; message?: string; [key: string]: unknown }
  | { status: 'fail'; code?: number; message: string };

export interface AccessTokenPayload extends JWTPayload {
  userid: string;
  role: string;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  type: string;
}

export type JwtCheckResult =
  | { status: 'success'; users: RefreshTokenPayload }
  | { status: 'fail'; message: unknown };
