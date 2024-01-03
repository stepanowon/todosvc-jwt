"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _tododao = require("./tododao");
var _authutil = require("./authutil");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var _default = exports["default"] = function _default(app) {
  app.get('/', function (req, res) {
    console.log("### GET /");
    res.render('index', {
      title: 'jwt 인증 테스트 서비스 v1.0',
      subtitle: '(node.js + express + lokijs + jwt)'
    });
  });
  app.post('/users/create', function (req, res) {
    console.log("### POST /users/create");
    var _req$body = req.body,
      userid = _req$body.userid,
      password = _req$body.password,
      username = _req$body.username;
    var hashedPassword = (0, _authutil.computeHMAC)(userid, password);
    var result = (0, _tododao.createUser)({
      userid: userid,
      username: username,
      password: hashedPassword
    });
    res.json(result);
  });
  app.post('/login', function (req, res) {
    console.log("### POST /login");
    var _req$body2 = req.body,
      userid = _req$body2.userid,
      password = _req$body2.password;
    var hashedPassword = (0, _authutil.computeHMAC)(userid, password);
    var doc = (0, _tododao.findUser)({
      userid: userid,
      password: hashedPassword
    });
    if (doc && doc.status === "success") {
      var access_token = (0, _authutil.createToken)({
        userid: userid,
        role: "users"
      });
      var refresh_token = (0, _authutil.createRefreshToken)({
        userid: userid,
        type: "refresh_token",
        role: "users"
      });
      res.json({
        status: "success",
        message: "로그인 성공",
        access_token: access_token,
        refresh_token: refresh_token
      });
    } else {
      res.json(doc);
    }
  });
  app.post('/token', function (req, res) {
    console.log("### POST /token");
    var refresh_token = req.body.refresh_token;
    console.log(refresh_token);
    if (!refresh_token) {
      var auth_header = req.headers.authorization;
      if (auth_header) {
        var _auth_header$split = auth_header.split(" "),
          _auth_header$split2 = _slicedToArray(_auth_header$split, 2),
          name = _auth_header$split2[0],
          token = _auth_header$split2[1];
        if (typeof name === "string" && name === "Bearer") {
          refresh_token = token;
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
    }
    console.log(refresh_token);
    (0, _authutil.checkRefreshToken)({
      refresh_token: refresh_token,
      callback: function callback(jwtresult) {
        if (jwtresult.status === "success") {
          var _jwtresult$users = jwtresult.users,
            userid = _jwtresult$users.userid,
            role = _jwtresult$users.role,
            type = _jwtresult$users.type;
          var access_token = (0, _authutil.createToken)({
            userid: userid,
            role: role
          });
          var _refresh_token = (0, _authutil.createRefreshToken)({
            userid: userid,
            type: type,
            role: role
          });
          res.json({
            status: "success",
            message: "토큰 갱신 성공",
            access_token: access_token,
            refresh_token: _refresh_token
          });
        } else {
          res.json(jwtresult);
        }
      }
    });
  });
  app.get('/todolist', function (req, res) {
    console.log("### GET /todolist : " + req.users.userid);
    var userid = req.users.userid;
    var response = (0, _tododao.getTodoList)({
      userid: userid
    });
    res.json(response);
  });
  app.post('/todolist', function (req, res) {
    console.log("### POST /todolist : " + req.users.userid);
    var userid = req.users.userid;
    var _req$body3 = req.body,
      todo = _req$body3.todo,
      desc = _req$body3.desc;
    var response = (0, _tododao.addTodo)({
      userid: userid,
      todo: todo,
      desc: desc
    });
    res.json(response);
  });
  app["delete"]('/todolist/:id', function (req, res) {
    console.log("### PUT /todolist/:id : " + req.users.userid);
    var userid = req.users.userid;
    var id = parseInt(req.params.id, 10);
    var response = (0, _tododao.deleteTodo)({
      userid: userid,
      id: id
    });
    res.json(response);
  });

  //----에러 처리 시작
  app.get('*', function (req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
  });
  app.use(function (err, req, res, next) {
    console.log("### ERROR!!");
    if (err.status === 404) {
      res.status(404).json({
        status: 404,
        message: "잘못된 URI 요청"
      });
    } else if (err.status === 500) {
      res.status(500).json({
        status: 500,
        message: "내부 서버 오류"
      });
    } else {
      res.status(err.status).jsonp({
        status: "fail",
        message: err.message
      });
    }
  });
};
//# sourceMappingURL=routes.js.map