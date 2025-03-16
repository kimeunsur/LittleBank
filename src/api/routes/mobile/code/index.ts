import { ApiRouter } from "../../default";
import { codeCtrl } from "./codeCtrl";

const getCodeBank = new ApiRouter({
  name: 'bank',
  method: 'get',
  summary: '은행 코드 조회',
  description: `
    v1.0.1
    2024-10-14 11:00
    작성자 : 주지민

    api 정상화
    ---------------------------------------

    v1.0.0
    2024-10-02 17:55
    작성자 : 윤재상
    ---------------------------------------
  `,
  tags: ['Code'],
  isPublic: true,  
  responses: {
    200: { schema: 'responses/mobile/code/getCodeBank' }
  },
  handler: codeCtrl.getCodeBank
})

export {
  getCodeBank,
}