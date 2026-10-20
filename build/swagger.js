"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const apiResult = (description) => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
});
const unauthorized = apiResult('인증 실패 (토큰 누락, 형식 오류, 만료, 위조, refresh_token 사용)');
exports.swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'TodoSvc-JWT API',
        version: '1.0.0',
        description: 'JWT 인증 기반 할일 관리 REST API',
    },
    servers: [{ url: '/' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ApiResult: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['success', 'fail'] },
                    message: { type: 'string' },
                },
            },
            TodoItem: {
                type: 'object',
                properties: {
                    userid: { type: 'string' },
                    id: { type: 'integer' },
                    todo: { type: 'string' },
                    desc: { type: 'string' },
                },
            },
        },
    },
    paths: {
        '/users/create': {
            post: {
                summary: '사용자 등록',
                tags: ['auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userid', 'password', 'username'],
                                properties: {
                                    userid: { type: 'string' },
                                    password: { type: 'string' },
                                    username: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: apiResult('등록 성공'),
                    400: apiResult('필수 항목(userid, password, username) 누락'),
                    409: apiResult('이미 존재하는 사용자'),
                    500: apiResult('내부 서버 오류'),
                },
            },
        },
        '/login': {
            post: {
                summary: '로그인',
                tags: ['auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userid', 'password'],
                                properties: {
                                    userid: { type: 'string' },
                                    password: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: apiResult('로그인 성공 (access_token, refresh_token 포함)'),
                    400: apiResult('필수 항목(userid, password) 누락'),
                    401: apiResult('사용자 또는 암호 불일치'),
                    500: apiResult('내부 서버 오류'),
                },
            },
        },
        '/token': {
            post: {
                summary: 'Access token 갱신',
                tags: ['auth'],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    refresh_token: { type: 'string', description: 'body 또는 refresh_token 쿠키로 전달' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: apiResult('갱신 성공 (access_token, refresh_token 포함)'),
                    400: apiResult('refresh_token 누락'),
                    401: apiResult('유효하지 않거나 만료된 refresh_token'),
                },
            },
        },
        '/todolist': {
            get: {
                summary: '내 할일 목록 조회',
                tags: ['todolist'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: '할일 목록',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string' },
                                        todoList: { type: 'array', items: { $ref: '#/components/schemas/TodoItem' } },
                                    },
                                },
                            },
                        },
                    },
                    401: unauthorized,
                    500: apiResult('내부 서버 오류'),
                },
            },
            post: {
                summary: '할일 추가',
                tags: ['todolist'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['todo'],
                                properties: {
                                    todo: { type: 'string' },
                                    desc: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: apiResult('추가 성공'),
                    400: apiResult('할일(todo) 누락'),
                    401: unauthorized,
                    500: apiResult('내부 서버 오류'),
                },
            },
        },
        '/todolist/{id}': {
            delete: {
                summary: '할일 삭제',
                tags: ['todolist'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: apiResult('삭제 성공'),
                    400: apiResult('id가 정수가 아님'),
                    401: unauthorized,
                    404: apiResult('삭제하려는 데이터가 존재하지 않음'),
                    500: apiResult('내부 서버 오류'),
                },
            },
        },
    },
};
//# sourceMappingURL=swagger.js.map