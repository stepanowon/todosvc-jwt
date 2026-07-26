import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'crypto'

let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}
const secret = new TextEncoder().encode(secretKey);

const createToken = ({ userid, role }) => {
    return new SignJWT({ userid, role, iss:"jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret)
}

const createRefreshToken = ({ userid, role, type }) => {
    return new SignJWT({ userid, role, type, iss:"jwt test server" })
        .setProtectedHeader({ alg: "HS512", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)
}

const checkToken = ({ token, callback }) => {
    jwtVerify(token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
        if (payload.type === "refresh_token") {
            callback({ status:"fail", message: "use your valid access_token" })
        } else {
            callback({ status:"success", users: payload })
        }
    }).catch((err) => {
        callback({ status:"fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err })
    })
}

const checkRefreshToken = ({ refresh_token, callback }) => {
    jwtVerify(refresh_token, secret, { algorithms: ['HS512'] }).then(({ payload }) => {
        callback({ status:"success", users: payload })
    }).catch((err) => {
        callback({ status:"fail", message: err.code === "ERR_JWT_EXPIRED" ? "expired token" : err })
    })
}

const computeHMAC = (userid, password) => {
    return createHash('sha256').update(userid + ":" +password).digest('hex');
} 

export { createToken, createRefreshToken, checkToken, computeHMAC, checkRefreshToken };