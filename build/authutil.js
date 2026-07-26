"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHMAC = exports.checkRefreshToken = exports.checkToken = exports.createRefreshToken = exports.createToken = void 0;
const crypto_1 = require("crypto");
let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}
const secret = new TextEncoder().encode(secretKey);
// jose는 ESM 전용 패키지라 tsc가 commonjs로 빌드할 때 require()로는 로드할 수 없다.
// tsc는 import()도 require()로 downlevel 해버리므로, Function 생성자로 감싸
// 진짜 네이티브 동적 import()를 강제한다. (Vercel 등 CJS 런타임 대응)
let josePromise = null;
const importJose = () => {
    if (!josePromise) {
        const dynamicImport = new Function('specifier', 'return import(specifier)');
        josePromise = dynamicImport('jose');
    }
    return josePromise;
};
const createToken = async ({ userid, role }) => {
    const { SignJWT } = await importJose();
    return new SignJWT({ userid, role, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
};
exports.createToken = createToken;
const createRefreshToken = async ({ userid, role, type }) => {
    const { SignJWT } = await importJose();
    return new SignJWT({ userid, role, type, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
};
exports.createRefreshToken = createRefreshToken;
const checkToken = ({ token, callback }) => {
    importJose().then(({ jwtVerify }) => jwtVerify(token, secret, { algorithms: ['HS512'] })).then(({ payload }) => {
        const users = payload;
        if (users.type === "refresh_token") {
            callback({ status: "fail", message: "use your valid access_token" });
        }
        else {
            callback({ status: "success", users });
        }
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
};
exports.checkToken = checkToken;
const checkRefreshToken = ({ refresh_token, callback }) => {
    importJose().then(({ jwtVerify }) => jwtVerify(refresh_token, secret, { algorithms: ['HS512'] })).then(({ payload }) => {
        callback({ status: "success", users: payload });
    }).catch((err) => {
        callback({ status: "fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err });
    });
};
exports.checkRefreshToken = checkRefreshToken;
const computeHMAC = (userid, password) => {
    return (0, crypto_1.createHash)('sha256').update(userid + ":" + password).digest('hex');
};
exports.computeHMAC = computeHMAC;
//# sourceMappingURL=authutil.js.map