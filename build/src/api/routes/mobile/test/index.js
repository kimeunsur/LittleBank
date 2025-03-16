"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testt = void 0;
const default_1 = require("../../default");
const testCtrl_1 = require("./testCtrl");
const testt = new default_1.ApiRouter({
    name: 'test',
    method: 'get',
    summary: 'test api',
    description: `
    hi hi i'm so hi
  `,
    tags: ['Test'],
    isPublic: true,
    responses: {
        200: { description: 'success' }
    },
    handler: testCtrl_1.testCtrl.testt
});
exports.testt = testt;
