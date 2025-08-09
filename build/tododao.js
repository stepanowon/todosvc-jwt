"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTodoList = exports.findUser = exports.deleteTodo = exports.createUser = exports.addTodo = void 0;
var _lokijs = _interopRequireDefault(require("lokijs"));
var _authutil = require("./authutil");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ts = new Date().getTime();
var todoList, users;
var databaseInitialize = function databaseInitialize() {
  todoList = db.getCollection("todoList");
  if (todoList === null) {
    todoList = db.addCollection('todoList', {
      indices: ['userid', 'id']
    });
    //샘플 데이터
    todoList.insert({
      userid: "admin",
      id: ++ts,
      todo: "관리자 업무1",
      desc: "관리자 업무1을 수행합니다."
    });
    todoList.insert({
      userid: "admin",
      id: ++ts,
      todo: "관리자 업무2",
      desc: "관리자 업무1을 수행합니다."
    });
    todoList.insert({
      userid: "gdhong",
      id: ++ts,
      todo: "ES6공부를 해야 합니다",
      desc: "설명1"
    });
    todoList.insert({
      userid: "gdhong",
      id: ++ts,
      todo: "리액트 학습",
      desc: "리액트 학습을 해야 합니다"
    });
    todoList.insert({
      userid: "mrlee",
      id: ++ts,
      todo: "남원구경",
      desc: "고향집에 가봐야합니다."
    });
    todoList.insert({
      userid: "mrlee",
      id: ++ts,
      todo: "Redux 마스터",
      desc: "Redux를 이해하는 것은 중요해"
    });
  }
  users = db.getCollection("users");
  if (users === null) {
    users = db.addCollection("users", {
      indices: ["userid", "password"]
    });
    users.insert({
      userid: "admin",
      password: (0, _authutil.computeHMAC)("admin", "1234"),
      username: "관리자",
      role: "admins"
    });
    users.insert({
      userid: "gdhong",
      password: (0, _authutil.computeHMAC)("gdhong", "1234"),
      username: "홍길동",
      role: "users"
    });
    users.insert({
      userid: "mrlee",
      password: (0, _authutil.computeHMAC)("mrlee", "1234"),
      username: "이몽룡",
      role: "users"
    });
  }
};

//let db = new loki();
var db = new _lokijs["default"]('sample.db', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 10000
});
var findUser = exports.findUser = function findUser(_ref) {
  var userid = _ref.userid,
    password = _ref.password;
  try {
    var userOne = users.findOne({
      userid: userid,
      password: password
    });
    if (userOne) {
      return {
        status: "success",
        message: "로그인 성공!",
        role: userOne.role
      };
    } else {
      return {
        status: "fail",
        message: "로그인 실패 : 사용자, 암호를 확인하세요"
      };
    }
  } catch (ex) {
    return {
      status: "fail",
      message: "로그인 실패 : " + ex
    };
  }
};
var createUser = exports.createUser = function createUser(_ref2) {
  var userid = _ref2.userid,
    password = _ref2.password,
    username = _ref2.username,
    _ref2$role = _ref2.role,
    role = _ref2$role === void 0 ? "users" : _ref2$role;
  try {
    var doc = users.findOne({
      userid: userid
    });
    if (doc) throw new Error("이미 존재하는 사용자입니다.");
    users.insert({
      userid: userid,
      password: password,
      username: username,
      role: role
    });
    //샘플 데이터
    todoList.insert({
      userid: userid,
      id: new Date().getTime(),
      todo: "ES6공부를 해야 합니다",
      desc: "리액트 학습을 위해 ES6를 익혀야 합니다."
    });
    todoList.insert({
      userid: userid,
      id: new Date().getTime() + 1,
      todo: "리액트 학습",
      desc: "리액트 학습을 해야 합니다"
    });
    return {
      status: "success",
      message: "사용자 등록 성공!"
    };
  } catch (ex) {
    return {
      status: "fail",
      message: "사용자 등록 실패 : " + ex.message
    };
  }
};
var getTodoList = exports.getTodoList = function getTodoList(_ref3) {
  var userid = _ref3.userid;
  try {
    var result = [];
    var queryResult = todoList.chain().find({
      userid: userid
    }).simplesort("regts").data();
    for (var i = 0; i < queryResult.length; i++) {
      var item = _objectSpread({}, queryResult[i]);
      delete item.meta;
      delete item["$loki"];
      delete item.owner;
      result.push(item);
    }
    return {
      status: "success",
      todoList: result
    };
  } catch (ex) {
    return {
      status: "fail",
      message: "조회 실패 : " + ex
    };
  }
};
var addTodo = exports.addTodo = function addTodo(_ref4) {
  var userid = _ref4.userid,
    todo = _ref4.todo,
    desc = _ref4.desc;
  try {
    if (todo === null || todo.trim() === "") {
      throw new Error("할일을 입력하셔야 합니다.");
    }
    var item = {
      userid: userid,
      id: new Date().getTime(),
      todo: todo,
      desc: desc
    };
    todoList.insert(item);
    return {
      status: "success",
      message: "추가 성공",
      item: {
        id: item.id,
        todo: item.todo,
        desc: item.desc
      }
    };
  } catch (ex) {
    return {
      status: "fail",
      message: "추가 실패 : " + ex
    };
  }
};
var deleteTodo = exports.deleteTodo = function deleteTodo(_ref5) {
  var userid = _ref5.userid,
    id = _ref5.id;
  try {
    var one = todoList.findOne({
      userid: userid,
      id: id
    });
    if (one !== null) {
      todoList.remove(one);
      return {
        status: "success",
        message: "삭제 성공",
        item: {
          id: one.id,
          todo: one.todo,
          desc: one.desc
        }
      };
    } else {
      return {
        status: "fail",
        message: "삭제 실패 : 삭제하려는 데이터가 존재하지 않음"
      };
    }
  } catch (ex) {
    return {
      status: "fail",
      message: "삭제 실패 : " + ex
    };
  }
};
//# sourceMappingURL=tododao.js.map