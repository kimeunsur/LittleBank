"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlock = exports.getBlocksUsingPaging = exports.postBlock = void 0;
const default_1 = require("../../default");
const blockCtrl_1 = require("./blockCtrl");
const postBlock = new default_1.ApiRouter({
    name: '',
    method: 'post',
    summary: '친구 차단',
    description: `
    v1.0.0
    2024-08-14 18:00
    작성자 : 윤재상
    ---------------------------------------
  `,
    tags: ['Block'],
    isPublic: false,
    schema: 'requests/mobile/block/postBlock',
    responses: {
        200: { description: 'success' }
    },
    handler: blockCtrl_1.blockCtrl.postBlock
});
exports.postBlock = postBlock;
const getBlocksUsingPaging = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '차단 목록 조회',
    description: `
    v1.0.0
    2024-08-14 18:00
    작성자 : 윤재상
    ---------------------------------------   
  `,
    tags: ['Block'],
    isPublic: false,
    schema: 'common/page',
    responses: {
        200: { schema: 'responses/mobile/block/getBlocks' }
    },
    handler: blockCtrl_1.blockCtrl.getBlocksUsingPaging
});
exports.getBlocksUsingPaging = getBlocksUsingPaging;
const deleteBlock = new default_1.ApiRouter({
    name: ':id',
    method: 'delete',
    summary: '차단 삭제',
    description: `
    v1.0.0
    2028-14-01 11:00
    작성자 : 윤재상
    ---------------------------------------
    id -> blockProfileId -> 차단할 친구 프로필 아이디    

  `,
    tags: ['Block'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { description: 'success' }
    },
    handler: blockCtrl_1.blockCtrl.deleteBlock
});
exports.deleteBlock = deleteBlock;
