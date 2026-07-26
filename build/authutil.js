"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHMAC = exports.checkRefreshToken = exports.checkToken = exports.createRefreshToken = exports.createToken = void 0;
const jose_1 = require("jose");
const crypto_1 = require("crypto");
let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}
const secret = new TextEncoder().encode(secretKey);
const createToken = ({ userid, role }) => {
    return new jose_1.SignJWT({ userid, role, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
};
exports.createToken = createToken;
const createRefreshToken = ({ userid, role, type }) => {
    return new jose_1.SignJWT({ userid, role, type, iss: "jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
};
exports.createRefreshToken = createRefreshToken;
const checkToken = ({ token, callback }) => {
    (0, jose_1.jwtVerify)(token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
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
    (0, jose_1.jwtVerify)(refresh_token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
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