"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAllowanceChatComplete = exports.getAllowanceChat = exports.postAllowanceChat = exports.deleteAllowanceTask = exports.putAllowanceTask = exports.getAllowanceTasks = exports.postAllowanceTask = void 0;
const default_1 = require("../../default");
const allowanceCtrl_1 = require("./allowanceCtrl");
const postAllowanceTask = new default_1.ApiRouter({
    name: 'task',
    method: 'post',
    summary: '용돈 항목 생성(부모)',
    description: `
    v1.0.0
    2024-07-30 10:00
    작성자 : 주지민
    ---------------------------------------
    required: 
    "taskContent" -> string
    "taskAmount" -> integer
  `,
    tags: ['Allowance'],
    isPublic: false,
    schema: 'requests/mobile/allowance/postAllowanceTask',
    responses: {
        200: { description: 'success' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.postAllowanceTask
});
exports.postAllowanceTask = postAllowanceTask;
const getAllowanceTasks = new default_1.ApiRouter({
    name: 'task',
    method: 'get',
    summary: '용돈 항목 조회',
    description: `
    v1.0.0
    2024-07-30 10:00
    작성자 : 주지민
    ---------------------------------------    
    v1.0.0
    2024-11-19 10:00
    작성자 : 윤재상

    총 길이가 0일 때 메시지 예외처리
    ---------------------------------------    
  `,
    tags: ['Allowance'],
    isPublic: false,
    schema: 'common/page',
    responses: {
        200: { schema: 'responses/mobile/allowance/getAllowanceTasks' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.getAllowanceTasks
});
exports.getAllowanceTasks = getAllowanceTasks;
const putAllowanceTask = new default_1.ApiRouter({
    name: 'task/:id',
    method: 'put',
    summary: '용돈 항목 수정(부모)',
    description: `
    v1.0.0
    2024-07-30 10:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceTaskId

    "taskContent" -> string
    "taskAmount" -> integer

  `,
    tags: ['Allowance'],
    isPublic: false,
    paths: ['common/idPath'],
    schema: 'requests/mobile/allowance/putAllowanceTask',
    responses: {
        200: { description: 'success' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.putAllowanceTask
});
exports.putAllowanceTask = putAllowanceTask;
const deleteAllowanceTask = new default_1.ApiRouter({
    name: 'task/:id',
    method: 'delete',
    summary: '용돈 항목 삭제(부모)',
    description: `
    v1.0.0
    2024-07-30 10:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceTaskId

  `,
    tags: ['Allowance'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { description: 'success' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.deleteAllowanceTask
});
exports.deleteAllowanceTask = deleteAllowanceTask;
const postAllowanceChat = new default_1.ApiRouter({
    name: '',
    method: 'post',
    summary: '용돈 요청(아이-채팅)',
    description: `
    v1.0.0
    2024-07-31 11:00
    작성자 : 주지민
    ---------------------------------------
    required: 
    "chatRoomId" -> integer 채팅방id
    "allowanceTaskId" -> integer 용돈항목 id (allowance task drop box)
    "allowanceChat" -> string 메세지 내용
    "allowanceChatImage" -> string 사진첨부
  `,
    tags: ['Allowance'],
    isPublic: false,
    schema: 'requests/mobile/allowance/postAllowanceChat',
    responses: {
        200: { description: 'success' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.postAllowanceChat
});
exports.postAllowanceChat = postAllowanceChat;
const getAllowanceChat = new default_1.ApiRouter({
    name: ':id',
    method: 'get',
    summary: '용돈 요청 조회',
    description: `
    v1.0.0
    2024-08-01 16:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceChatId    

    v1.0.0
    2024-11-29 15:00
    작성자 : 윤재상
    ---------------------------------------    
    allowanceChatStatus -> enum('complete','pending')
  `,
    tags: ['Allowance'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { schema: 'responses/mobile/allowance/getAllowanceChat' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.getAllowanceChat
});
exports.getAllowanceChat = getAllowanceChat;
const putAllowanceChatComplete = new default_1.ApiRouter({
    name: 'complete/:id',
    method: 'put',
    summary: '용돈 이체(부모-채팅)',
    description: `
    v1.0.0
    2024-07-31 12:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceChatId

  `,
    tags: ['Allowance'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { description: 'success' }
    },
    handler: allowanceCtrl_1.allowanceCtrl.putAllowanceChatComplete
});
exports.putAllowanceChatComplete = putAllowanceChatComplete;
