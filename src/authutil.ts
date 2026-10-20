import type { SignJWT as SignJWTType, jwtVerify as jwtVerifyType } from 'jose';
import { createHash } from 'crypto';
import type { JwtCheckResult, RefreshTokenPayload } from './types';
import { jwtConfig } from './config';

const secret = new TextEncoder().encode(jwtConfig.secretKey);
const { algorithm, issuer } = jwtConfig;

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
    return new SignJWT({ userid, role, iss: issuer })
        .setProtectedHeader({ alg: algorithm, typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(jwtConfig.accessTokenExpiresIn)
        .sign(secret);
}

export const createRefreshToken = async ({ userid, role, type }: { userid: string; role: string; type: string }): Promise<string> => {
    const { SignJWT } = await importJose();
    return new SignJWT({ userid, role, type, iss: issuer })
        .setProtectedHeader({ alg: algorithm, typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(jwtConfig.refreshTokenExpiresIn)
        .sign(secret);
}

export const checkToken = ({ token, callback }: { token: string; callback: (result: JwtCheckResult) => void }): void => {
    importJose().then(({ jwtVerify }) => jwtVerify(token, secret, { algorithms: [algorithm] })).then(({ payload }) => {
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
    importJose().then(({ jwtVerify }) => jwtVerify(refresh_token, secret, { algorithms: [algorithm] })).then(({ payload }) => {
        const users = payload as RefreshTokenPayload;
        //access_token으로 토큰을 재발급받지 못하도록 refresh_token인지 확인한다
        if (users.type !== "refresh_token") {
            callback({ status: "fail", message: "use your valid refresh_token" });
        } else {
            callback({ status: "success", users });
        }
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
}

export const computeHMAC = (userid: string, password: string): string => {
    return createHash('sha256').update(userid + ":" + password).digest('hex');
}
