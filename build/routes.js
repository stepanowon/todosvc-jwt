"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tododao_1 = require("./tododao");
const authutil_1 = require("./authutil");
const authmiddleware_1 = require("./authmiddleware");
//DAO 결과의 code를 HTTP Status Code로 사용하고, body에서는 제외한다
const sendResult = (res, result) => {
    const { code, ...body } = result;
    return res.status(code ?? (result.status === "success" ? 200 : 500)).json(body);
};
const isBlank = (value) => typeof value !== "string" || value.trim() === "";
exports.default = (app) => {
    app.get('/', (req, res) => {
        console.log("### GET /");
        res.render('index', {
            title: 'jwt 인증 테스트 서비스 v1.0',
            subtitle: '(node.js + express + lokijs + jwt)'
        });
    });
    app.post('/users/create', (req, res) => {
        console.log("### POST /users/create");
        let { userid, password, username } = req.body ?? {};
        if (isBlank(userid) || isBlank(password) || isBlank(username)) {
            return res.status(400).json({ status: "fail", message: "사용자 등록 실패 : userid, password, username을 모두 입력하세요" });
        }
        let hashedPassword = (0, authutil_1.computeHMAC)(userid, password);
        const result = (0, tododao_1.createUser)({ userid, username, password: hashedPassword });
        sendResult(res, result);
    });
    app.post('/login', async (req, res) => {
        console.log("### POST /login");
        let { userid, password } = req.body ?? {};
        if (isBlank(userid) || isBlank(password)) {
            return res.status(400).json({ status: "fail", message: "로그인 실패 : userid, password를 입력하세요" });
        }
        let hashedPassword = (0, authutil_1.computeHMAC)(userid, password);
        const doc = (0, tododao_1.findUser)({ userid, password: hashedPassword });
        if (doc && doc.status === "success") {
            let access_token = await (0, authutil_1.createToken)({ userid, role: doc.role });
            let refresh_token = await (0, authutil_1.createRefreshToken)({ userid, type: "refresh_token", role: doc.role });
            return res.json({ status: "success", message: "로그인 성공", access_token, refresh_token });
        }
        else {
            return sendResult(res, doc);
        }
    });
    app.post('/token', (req, res) => {
        console.log("### POST /token");
        let { refresh_token } = req.body ?? {};
        if (req.cookies["refresh_token"]) {
            refresh_token = req.cookies["refresh_token"];
        }
        console.log(req.cookies);
        if (!refresh_token) {
            return res.status(400).json({
                status: "fail",
                message: "refresh_token이 존재하지 않습니다. Request body 또는 http only cookie로 전달하세요"
            });
        }
        else {
            (0, authutil_1.checkRefreshToken)({ refresh_token, callback: async (jwtresult) => {
                    if (jwtresult.status === "success") {
                        let { userid, role } = jwtresult.users;
                        let access_token = await (0, authutil_1.createToken)({ userid, role });
                        let refresh_token = await (0, authutil_1.createRefreshToken)({ userid, type: "refresh_token", role });
                        return res.json({ status: "success", message: "토큰 갱신 성공", access_token, refresh_token });
                    }
                    else {
                        return res.status(401).json(jwtresult);
                    }
                } });
        }
    });
    app.get('/todolist', authmiddleware_1.authenticate, (req, res) => {
        console.log("### GET /todolist : " + req.users.userid);
        let userid = req.users.userid;
        let response = (0, tododao_1.getTodoList)({ userid });
        sendResult(res, response);
    });
    app.post('/todolist', authmiddleware_1.authenticate, (req, res) => {
        console.log("### POST /todolist : " + req.users.userid);
        let userid = req.users.userid;
        let { todo, desc } = req.body ?? {};
        let response = (0, tododao_1.addTodo)({ userid, todo, desc });
        sendResult(res, response);
    });
    app.delete('/todolist/:id', authmiddleware_1.authenticate, (req, res) => {
        console.log("### DELETE /todolist/:id : " + req.users.userid);
        let userid = req.users.userid;
        if (!/^\d+$/.test(req.params.id)) {
            return res.status(400).json({ status: "fail", message: "삭제 실패 : id는 정수여야 합니다" });
        }
        let id = parseInt(req.params.id, 10);
        let response = (0, tododao_1.deleteTodo)({ userid, id });
        sendResult(res, response);
    });
    //----에러 처리 시작
    //GET 외의 메서드로 들어온 잘못된 URI 요청도 JSON 404로 응답한다
    app.use((req, res, next) => {
        const err = new Error();
        err.status = 404;
        next(err);
    });
    app.use((err, req, res, next) => {
        console.log("### ERROR!!");
        if (err.status === 404) {
            res.status(404).json({ status: 404, message: "잘못된 URI 요청" });
        }
        else if (err.status === 500) {
            res.status(500).json({ status: 500, message: "내부 서버 오류" });
        }
        else {
            res.status(err.status ?? 500).jsonp({ status: "fail", message: err.message });
        }
    });
};
//# sourceMappingURL=routes.js.map