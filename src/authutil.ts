import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import type { JwtCheckResult, RefreshTokenPayload } from './types';

let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}
const secret = new TextEncoder().encode(secretKey);

export const createToken = ({ userid, role }: { userid: string; role: string }): Promise<string> => {
    return new SignJWT({ userid, role, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}

export const createRefreshToken = ({ userid, role, type }: { userid: string; role: string; type: string }): Promise<string> => {
    return new SignJWT({ userid, role, type, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export const checkToken = ({ token, callback }: { token: string; callback: (result: JwtCheckResult) => void }): void => {
    jwtVerify(token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
        const users = payload as RefreshTokenPayload;
        if (users.type === "refresh_token") {
            callback({ status: "fail", message: "use your valid access_token" });
        } else {
            callback({ status: "success", users });
        }
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
}

export const checkRefreshToken = ({ refresh_token, callback }: { refresh_token: string; callback: (result: JwtCheckResult) => void }): void => {
    jwtVerify(refresh_token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
        callback({ status: "success", users: payload as RefreshTokenPayload });
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
}

export const computeHMAC = (userid: string, password: string): string => {
    return createHash('sha256').update(userid + ":" + password).digest('hex');
}
