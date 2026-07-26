import loki, { Collection } from 'lokijs';
import { computeHMAC } from './authutil';
import type { TodoItem, UserRecord, ApiResult } from './types';

let ts = new Date().getTime();
let todoList: Collection<TodoItem>;
let users: Collection<UserRecord>;

const databaseInitialize = () => {
    todoList = db.getCollection<TodoItem>("todoList");
    if (todoList === null) {
        todoList = db.addCollection<TodoItem>('todoList', { indices: ['userid', 'id'] });
        //샘플 데이터
        todoList.insert({ userid: "admin", id: ++ts, todo: "관리자 업무1", desc:"관리자 업무1을 수행합니다." });
        todoList.insert({ userid: "admin", id: ++ts, todo: "관리자 업무2", desc:"관리자 업무1을 수행합니다." });
        todoList.insert({ userid: "gdhong", id: ++ts, todo: "ES6공부를 해야 합니다", desc:"설명1" });
        todoList.insert({ userid: "gdhong", id: ++ts, todo: "리액트 학습", desc:"리액트 학습을 해야 합니다" });
        todoList.insert({ userid: "mrlee", id: ++ts, todo: "남원구경", desc:"고향집에 가봐야합니다." });
        todoList.insert({ userid: "mrlee", id: ++ts, todo: "Redux 마스터", desc:"Redux를 이해하는 것은 중요해" });
    }
    users = db.getCollection<UserRecord>("users");
    if (users === null) {
        users = db.addCollection<UserRecord>("users", { indices: ["userid", "password"] });
        users.insert({ userid: "admin", password:computeHMAC("admin","1234"), username:"관리자", role:"admins" });
        users.insert({ userid: "gdhong", password:computeHMAC("gdhong","1234"), username:"홍길동", role:"users" });
        users.insert({ userid: "mrlee", password:computeHMAC("mrlee","1234"), username:"이몽룡", role:"users" });
    }
}

const db = new loki('sample.db', {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 10000
});

export const findUser = ({ userid, password }: { userid: string; password: string }): ApiResult & { role?: string } => {
    try {
        let userOne = users.findOne({ userid, password } as Partial<UserRecord>);
        if (userOne) {
            return { status: "success", message: "로그인 성공!", role: userOne.role };
        } else {
            return { status: "fail", message: "로그인 실패 : 사용자, 암호를 확인하세요" };
        }
    } catch (ex) {
        return { status: "fail", message: "로그인 실패 : " + ex };
    }
}

export const createUser = ({ userid, password, username, role = "users" }: { userid: string; password: string; username: string; role?: string }): ApiResult => {
    try {
        let doc = users.findOne({ userid } as Partial<UserRecord>);
        if (doc) throw new Error("이미 존재하는 사용자입니다.");
        users.insert({ userid, password, username, role });
        //샘플 데이터
        todoList.insert({ userid, id: new Date().getTime(), todo: "ES6공부를 해야 합니다", desc:"리액트 학습을 위해 ES6를 익혀야 합니다." });
        todoList.insert({ userid, id: new Date().getTime() + 1, todo: "리액트 학습", desc:"리액트 학습을 해야 합니다" });
        return { status: "success", message: "사용자 등록 성공!" };
    } catch (ex) {
        return { status: "fail", message: "사용자 등록 실패 : " + (ex as Error).message };
    }
}

export const getTodoList = ({ userid }: { userid: string }): ApiResult & { todoList?: TodoItem[] } => {
    try {
        let queryResult = todoList.chain().find({ userid } as Partial<TodoItem>).simplesort("regts" as any).data();
        let result: TodoItem[] = queryResult.map((doc) => {
            let item: any = { ...doc };
            delete item.meta;
            delete item["$loki"];
            delete item.owner;
            return item as TodoItem;
        });
        return { status: "success", todoList: result };
    } catch (ex) {
        return { status: "fail", message: "조회 실패 : " + ex };
    }
};

export const addTodo = ({ userid, todo, desc }: { userid: string; todo: string; desc: string }): ApiResult => {
    try {
        if (todo === null || todo.trim() === "") {
            throw new Error("할일을 입력하셔야 합니다.");
        }
        let item: TodoItem = { userid, id: new Date().getTime(), todo, desc };
        todoList.insert(item);
        return { status: "success", message: "추가 성공", item: { id: item.id, todo: item.todo, desc: item.desc } };
    } catch (ex) {
        return { status: "fail", message: "추가 실패 : " + ex };
    }
};

export const deleteTodo = ({ userid, id }: { userid: string; id: number }): ApiResult => {
    try {
        let one = todoList.findOne({ userid, id } as Partial<TodoItem>);
        if (one !== null) {
            todoList.remove(one);
            return { status: "success", message: "삭제 성공", item: { id: one.id, todo: one.todo, desc: one.desc } };
        } else {
            return { status: "fail", message: "삭제 실패 : 삭제하려는 데이터가 존재하지 않음" };
        }
    } catch (ex) {
        return { status: "fail", message: "삭제 실패 : " + ex };
    }
};
