"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersions = void 0;
const default_1 = require("../../default");
const versionCtrl_1 = require("./versionCtrl");
const getVersions = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '필수 업데이트 버전',
    description: `
    v1.0.0
    2024-07-23 19:00
    작성자 : 주지민
    ---------------------------------------

    기기별 필수 업데이트 버전 조회
  `,
    tags: ['Version'],
    isPublic: true,
    responses: {
        200: { schema: 'responses/mobile/version/getVersion' }
    },
    handler: versionCtrl_1.appVersionCtrl.getVersions
});
exports.getVersions = getVersions;
