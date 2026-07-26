"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.addTodo = exports.getTodoList = exports.createUser = exports.findUser = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const authutil_1 = require("./authutil");
let ts = new Date().getTime();
let todoList;
let users;
const databaseInitialize = () => {
    todoList = db.getCollection("todoList");
    if (todoList === null) {
        todoList = db.addCollection('todoList', { indices: ['userid', 'id'] });
        //샘플 데이터
        todoList.insert({ userid: "admin", id: ++ts, todo: "관리자 업무1", desc: "관리자 업무1을 수행합니다." });
        todoList.insert({ userid: "admin", id: ++ts, todo: "관리자 업무2", desc: "관리자 업무1을 수행합니다." });
        todoList.insert({ userid: "gdhong", id: ++ts, todo: "ES6공부를 해야 합니다", desc: "설명1" });
        todoList.insert({ userid: "gdhong", id: ++ts, todo: "리액트 학습", desc: "리액트 학습을 해야 합니다" });
        todoList.insert({ userid: "mrlee", id: ++ts, todo: "남원구경", desc: "고향집에 가봐야합니다." });
        todoList.insert({ userid: "mrlee", id: ++ts, todo: "Redux 마스터", desc: "Redux를 이해하는 것은 중요해" });
    }
    users = db.getCollection("users");
    if (users === null) {
        users = db.addCollection("users", { indices: ["userid", "password"] });
        users.insert({ userid: "admin", password: (0, authutil_1.computeHMAC)("admin", "1234"), username: "관리자", role: "admins" });
        users.insert({ userid: "gdhong", password: (0, authutil_1.computeHMAC)("gdhong", "1234"), username: "홍길동", role: "users" });
        users.insert({ userid: "mrlee", password: (0, authutil_1.computeHMAC)("mrlee", "1234"), username: "이몽룡", role: "users" });
    }
};
// Vercel 등 서버리스 환경은 파일시스템이 읽기 전용이므로 쓰기 가능한 /tmp에 저장한다.
// (단, /tmp는 콜드 스타트마다 초기화되어 데이터가 영구 보존되지는 않는다.)
const dbPath = process.env.VERCEL ? path_1.default.join(os_1.default.tmpdir(), 'sample.db') : 'sample.db';
const db = new lokijs_1.default(dbPath, {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 10000
});
const findUser = ({ userid, password }) => {
    try {
        let userOne = users.findOne({ userid, password });
        if (userOne) {
            return { status: "success", message: "로그인 성공!", role: userOne.role };
        }
        else {
            return { status: "fail", message: "로그인 실패 : 사용자, 암호를 확인하세요" };
        }
    }
    catch (ex) {
        return { status: "fail", message: "로그인 실패 : " + ex };
    }
};
exports.findUser = findUser;
const createUser = ({ userid, password, username, role = "users" }) => {
    try {
        let doc = users.findOne({ userid });
        if (doc)
            throw new Error("이미 존재하는 사용자입니다.");
        users.insert({ userid, password, username, role });
        //샘플 데이터
        todoList.insert({ userid, id: new Date().getTime(), todo: "ES6공부를 해야 합니다", desc: "리액트 학습을 위해 ES6를 익혀야 합니다." });
        todoList.insert({ userid, id: new Date().getTime() + 1, todo: "리액트 학습", desc: "리액트 학습을 해야 합니다" });
        return { status: "success", message: "사용자 등록 성공!" };
    }
    catch (ex) {
        return { status: "fail", message: "사용자 등록 실패 : " + ex.message };
    }
};
exports.createUser = createUser;
const getTodoList = ({ userid }) => {
    try {
        let queryResult = todoList.chain().find({ userid }).simplesort("regts").data();
        let result = queryResult.map((doc) => {
            let item = { ...doc };
            delete item.meta;
            delete item["$loki"];
            delete item.owner;
            return item;
        });
        return { status: "success", todoList: result };
    }
    catch (ex) {
        return { status: "fail", message: "조회 실패 : " + ex };
    }
};
exports.getTodoList = getTodoList;
const addTodo = ({ userid, todo, desc }) => {
    try {
        if (todo === null || todo.trim() === "") {
            throw new Error("할일을 입력하셔야 합니다.");
        }
        let item = { userid, id: new Date().getTime(), todo, desc };
        todoList.insert(item);
        return { status: "success", message: "추가 성공", item: { id: item.id, todo: item.todo, desc: item.desc } };
    }
    catch (ex) {
        return { status: "fail", message: "추가 실패 : " + ex };
    }
};
exports.addTodo = addTodo;
const deleteTodo = ({ userid, id }) => {
    try {
        let one = todoList.findOne({ userid, id });
        if (one !== null) {
            todoList.remove(one);
            return { status: "success", message: "삭제 성공", item: { id: one.id, todo: one.todo, desc: one.desc } };
        }
        else {
            return { status: "fail", message: "삭제 실패 : 삭제하려는 데이터가 존재하지 않음" };
        }
    }
    catch (ex) {
        return { status: "fail", message: "삭제 실패 : " + ex };
    }
};
exports.deleteTodo = deleteTodo;
//# sourceMappingURL=tododao.js.map