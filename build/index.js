"use strict";

var _express = _interopRequireDefault(require("express"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _cors = _interopRequireDefault(require("cors"));
var _morgan = _interopRequireDefault(require("morgan"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _routes = _interopRequireDefault(require("./routes"));
var _authutil = require("./authutil");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var app = (0, _express["default"])();
app.use((0, _cors["default"])({
  origin: ['http://localhost:5173', 'https://testapp.com', 'http://react.test.com:5173'],
  credentials: true
}));
app.use((0, _cookieParser["default"])());

// Cache-Control 헤더 설정 (중복 제거)
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

//-- 로깅
var baseDir = _path["default"].resolve('.');
var rfs = require("rotating-file-stream");
var logDirectory = _path["default"].join(baseDir, '/log');
_fs["default"].existsSync(logDirectory) || _fs["default"].mkdirSync(logDirectory);
var accessLogStream = rfs.createStream("access.log", {
  size: "10M",
  interval: "1d",
  path: logDirectory
});
app.use((0, _morgan["default"])('combined', {
  stream: accessLogStream
}));
app.set('port', process.env.PORT || 3000);
app.use(_express["default"]["static"](baseDir + '/public'));
console.log(baseDir + '/views');
app.set('views', baseDir + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(_bodyParser["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));

//권한 검증용 MW
app.use(function (req, res, next) {
  if (!req.path.startsWith('/todolist') && !req.path.startsWith('/todolist_long')) {
    next();
    return;
  }
  //console.log("## JWT Middleware!! : " + req.path)
  var auth_header = req.headers.authorization;
  if (auth_header) {
    var _auth_header$split = auth_header.split(" "),
      _auth_header$split2 = _slicedToArray(_auth_header$split, 2),
      name = _auth_header$split2[0],
      token = _auth_header$split2[1];
    if (typeof name === "string" && name === "Bearer") {
      (0, _authutil.checkToken)({
        token: token,
        callback: function callback(jwtresult) {
          if (jwtresult.status === "success") {
            req.users = jwtresult.users;
            next();
          } else {
            res.json(jwtresult);
          }
        }
      });
    } else {
      res.json({
        status: "fail",
        message: "토큰의 형식이 올바르지 않습니다. Bearer Token 형식을 사용합니다."
      });
    }
  } else {
    res.json({
      status: "fail",
      message: "authorization 요청 헤더를 통해 토큰이 전달되지 않았습니다."
    });
  }
});
(0, _routes["default"])(app);
var server = app.listen(app.get('port'), function () {
  console.log("할일 목록 서비스가 " + app.get('port') + "번 포트에서 시작되었습니다!");
});
//# sourceMappingURL=index.js.map