"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
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
                    200: {
                        description: '등록 결과',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
                    },
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
                    200: {
                        description: '로그인 결과 (access_token, refresh_token 포함)',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
                    },
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
                    200: {
                        description: '갱신 결과 (access_token, refresh_token 포함)',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
                    },
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
                    200: {
                        description: '추가 결과',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
                    },
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
                    200: {
                        description: '삭제 결과',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResult' } } },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=swagger.js.map