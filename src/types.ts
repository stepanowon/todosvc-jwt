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

export type ApiResult =
  | { status: 'success'; message?: string; [key: string]: unknown }
  | { status: 'fail'; message: string };

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
