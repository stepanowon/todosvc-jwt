import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'

let secretKey = "mysecretkey";
if (process.env.JWT_SECRET_KEY) {
    secretKey = process.env.JWT_SECRET_KEY;
}

const createToken = ({ userid, role }) => {
    console.log(userid + ", "+role)
    let token = jwt.sign({
        userid, role
    }, secretKey, {
        algorithm : "HS256",
        expiresIn:"14d",
    })
    return token;
}

const checkToken = ({ token, callback }) => {
    jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, decode) => { 
        if (err) {
            callback({status: "fail", message:err })
        } else {
            const exp = new Date(decode.exp * 1000)
            const now = Date.now()
            if (exp < now) {
              callback({ status:"fail", message: "expired token" })
            } else {
              callback({ status:"success", users: decode})
            }
        }
    })
}

const computeHMAC = (userid, password) => {
    return createHash('sha256').update(userid + ":" +password).digest('hex');
} 

export { createToken, checkToken, computeHMAC };