"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _tododao = require("./tododao");
var _authutil = require("./authutil");
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
      var token = (0, _authutil.createToken)({
        userid: userid,
        role: "users"
      });
      res.json({
        status: "success",
        message: "로그인 성공",
        token: token
      });
    } else {
      res.json(doc);
    }
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