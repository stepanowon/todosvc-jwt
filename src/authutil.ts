import type { SignJWT as SignJWTType, jwtVerify as jwtVerifyType } from 'jose';
import { createHash } from 'crypto';
import type { JwtCheckResult, RefreshTokenPayload } from './types';

let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}
const secret = new TextEncoder().encode(secretKey);

type JoseModule = { SignJWT: typeof SignJWTType; jwtVerify: typeof jwtVerifyType };

// jose는 ESM 전용 패키지라 tsc가 commonjs로 빌드할 때 require()로는 로드할 수 없다.
// tsc는 import()도 require()로 downlevel 해버리므로, Function 생성자로 감싸
// 진짜 네이티브 동적 import()를 강제한다. (Vercel 등 CJS 런타임 대응)
let josePromise: Promise<JoseModule> | null = null;
const importJose = (): Promise<JoseModule> => {
    if (!josePromise) {
        const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<JoseModule>;
        josePromise = dynamicImport('jose');
    }
    return josePromise;
}

export const createToken = async ({ userid, role }: { userid: string; role: string }): Promise<string> => {
    const { SignJWT } = await importJose();
    return new SignJWT({ userid, role, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}

export const createRefreshToken = async ({ userid, role, type }: { userid: string; role: string; type: string }): Promise<string> => {
    const { SignJWT } = await importJose();
    return new SignJWT({ userid, role, type, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export const checkToken = ({ token, callback }: { token: string; callback: (result: JwtCheckResult) => void }): void => {
    importJose().then(({ jwtVerify }) => jwtVerify(token, secret, { algorithms: ['HS512'] })).then(({ payload }) => {
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
    importJose().then(({ jwtVerify }) => jwtVerify(refresh_token, secret, { algorithms: ['HS512'] })).then(({ payload }) => {
        callback({ status: "success", users: payload as RefreshTokenPayload });
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
}

export const computeHMAC = (userid: string, password: string): string => {
    return createHash('sha256').update(userid + ":" + password).digest('hex');
}
