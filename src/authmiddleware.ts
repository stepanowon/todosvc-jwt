import type { Request, Response, NextFunction } from 'express';
import { checkToken } from './authutil';

//인증 실패는 모두 401 + WWW-Authenticate 헤더로 응답한다 (RFC 6750)
const unauthorized = (res: Response, body: unknown, error = "invalid_token") => {
    res.status(401).set('WWW-Authenticate', `Bearer realm="todosvc", error="${error}"`).json(body);
}

//인증 MW : Bearer access_token을 검증하고 req.users에 토큰 정보를 설정한다
//보호가 필요한 라우트에 직접 지정한다. 예) app.get('/todolist', authenticate, handler)
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    let auth_header = req.headers.authorization;
    if (!auth_header) {
        return unauthorized(res, { status: "fail", message: "authorization 요청 헤더를 통해 토큰이 전달되지 않았습니다." }, "invalid_request");
    }
    let [name, token] = auth_header.split(" ");
    if (name !== "Bearer" || !token) {
        return unauthorized(res, { status: "fail", message: "토큰의 형식이 올바르지 않습니다. Bearer Token 형식을 사용합니다." }, "invalid_request");
    }
    checkToken({ token, callback: (jwtresult) => {
        if (jwtresult.status === "success") {
            req.users = jwtresult.users;
            next();
        } else {
            unauthorized(res, jwtresult);
        }
    }});
}

//인가 MW : 토큰의 role이 허용된 role 중 하나가 아니면 403으로 응답한다
//authenticate 다음에 지정한다. 예) app.delete('/admin/users/:id', authenticate, requireRole("admins"), handler)
export const requireRole = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (req.users && roles.includes(req.users.role)) {
        return next();
    }
    res.status(403).json({ status: "fail", message: "접근 권한이 없습니다." });
}
