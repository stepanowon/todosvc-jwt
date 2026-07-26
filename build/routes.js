"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _tododao = require("./tododao");
var _authutil = require("./authutil");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
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
  app.post('/login', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res) {
      var _req$body2, userid, password, hashedPassword, doc, access_token, refresh_token;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            console.log("### POST /login");
            _req$body2 = req.body, userid = _req$body2.userid, password = _req$body2.password;
            hashedPassword = (0, _authutil.computeHMAC)(userid, password);
            doc = (0, _tododao.findUser)({
              userid: userid,
              password: hashedPassword
            });
            if (!(doc && doc.status === "success")) {
              _context.n = 3;
              break;
            }
            _context.n = 1;
            return (0, _authutil.createToken)({
              userid: userid,
              role: doc.role
            });
          case 1:
            access_token = _context.v;
            _context.n = 2;
            return (0, _authutil.createRefreshToken)({
              userid: userid,
              type: "refresh_token",
              role: doc.role
            });
          case 2:
            refresh_token = _context.v;
            return _context.a(2, res.json({
              status: "success",
              message: "로그인 성공",
              access_token: access_token,
              refresh_token: refresh_token
            }));
          case 3:
            return _context.a(2, res.json(doc));
          case 4:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  app.post('/token', function (req, res) {
    console.log("### POST /token");
    var refresh_token = req.body.refresh_token;
    if (req.cookies["refresh_token"]) {
      refresh_token = req.cookies["refresh_token"];
    }
    console.log(req.cookies);
    if (!refresh_token) {
      return res.json({
        status: "fail",
        message: "refresh_token이 존재하지 않습니다. Request body 또는 http only cookie로 전달하세요"
      });
    } else {
      (0, _authutil.checkRefreshToken)({
        refresh_token: refresh_token,
        callback: function () {
          var _callback = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(jwtresult) {
            var _jwtresult$users, userid, role, type, access_token, _refresh_token;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  if (!(jwtresult.status === "success")) {
                    _context2.n = 3;
                    break;
                  }
                  _jwtresult$users = jwtresult.users, userid = _jwtresult$users.userid, role = _jwtresult$users.role, type = _jwtresult$users.type;
                  _context2.n = 1;
                  return (0, _authutil.createToken)({
                    userid: userid,
                    role: role
                  });
                case 1:
                  access_token = _context2.v;
                  _context2.n = 2;
                  return (0, _authutil.createRefreshToken)({
                    userid: userid,
                    type: type,
                    role: role
                  });
                case 2:
                  _refresh_token = _context2.v;
                  return _context2.a(2, res.json({
                    status: "success",
                    message: "토큰 갱신 성공",
                    access_token: access_token,
                    refresh_token: _refresh_token
                  }));
                case 3:
                  return _context2.a(2, res.json(jwtresult));
                case 4:
                  return _context2.a(2);
              }
            }, _callee2);
          }));
          function callback(_x3) {
            return _callback.apply(this, arguments);
          }
          return callback;
        }()
      });
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
  app.get('/*splat', function (req, res, next) {
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