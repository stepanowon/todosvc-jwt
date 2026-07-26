import type { RefreshTokenPayload } from './types';

declare global {
  namespace Express {
    interface Request {
      users?: RefreshTokenPayload;
    }
  }
}

export {};
