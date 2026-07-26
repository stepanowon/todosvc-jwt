"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rfs = __importStar(require("rotating-file-stream"));
const routes_1 = __importDefault(require("./routes"));
const authutil_1 = require("./authutil");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://testapp.com', 'http://react.test.com:5173'],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
// Cache-Control 헤더 설정 (중복 제거)
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
//-- 로깅
const baseDir = path_1.default.resolve('.');
const logDirectory = path_1.default.join(baseDir, '/log');
fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory);
const accessLogStream = rfs.createStream("access.log", {
    size: "10M",
    interval: "1d",
    path: logDirectory
});
app.use((0, morgan_1.default)('combined', { stream: accessLogStream }));
app.set('port', (process.env.PORT || 3000));
app.use(express_1.default.static(baseDir + '/public'));
console.log(baseDir + '/views');
app.set('views', baseDir + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
//권한 검증용 MW
app.use((req, res, next) => {
    if (!req.path.startsWith('/todolist') && !req.path.startsWith('/todolist_long')) {
        next();
        return;
    }
    //console.log("## JWT Middleware!! : " + req.path)
    let auth_header = req.headers.authorization;
    if (auth_header) {
        let [name, token] = auth_header.split(" ");
        if (typeof (name) === "string" && name === "Bearer") {
            (0, authutil_1.checkToken)({ token, callback: (jwtresult) => {
                    if (jwtresult.status === "success") {
                        req.users = jwtresult.users;
                        next();
                    }
                    else {
                        res.json(jwtresult);
                    }
                } });
        }
        else {
            res.json({ status: "fail", message: "토큰의 형식이 올바르지 않습니다. Bearer Token 형식을 사용합니다." });
        }
    }
    else {
        res.json({ status: "fail", message: "authorization 요청 헤더를 통해 토큰이 전달되지 않았습니다." });
    }
});
(0, routes_1.default)(app);
app.listen(app.get('port'), function () {
    console.log("할일 목록 서비스가 " + app.get('port') + "번 포트에서 시작되었습니다!");
});
//# sourceMappingURL=index.js.map