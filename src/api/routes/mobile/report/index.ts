import { ApiRouter } from "../../default"
import { reportCtrl } from "./reportCtrl"

const postReport = new ApiRouter({
  name: '',
  method: 'post',
  summary: '신고',
  description: `
    v1.0.0
    2024-08-20 18:00
    작성자 : 윤재상
    ---------------------------------------
  `,
  tags: ['Report'],
  isPublic: false,  
  schema: 'requests/mobile/report/postReport',
  responses: {
    200: { description: 'success'}   
  },
  handler: reportCtrl.postReport
})

const getReports = new ApiRouter({
  name: '',
  method: 'get',
  summary: '신고 목록 조회',
  description: `
    v1.0.0
    2024-08-21 09:00
    작성자 : 윤재상
    ---------------------------------------   
  `,
  tags: ['Report'],
  isPublic: false,
  schema: 'common/page',
  responses: {
    200: { schema: 'responses/mobile/report/getReports'}    
  },
  handler: reportCtrl.getReports
})

const deleteReport = new ApiRouter({
  name: ':id',
  method: 'delete',
  summary: '신고 삭제',
  description: `
    v1.0.0
    2028-14-01 11:00
    작성자 : 윤재상
    ---------------------------------------
    id -> reportProfileId -> 신고할 친구 프로필 아이디    

  `,
  tags: ['Report'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: reportCtrl.deleteReport
})

export {
  postReport,
  getReports,
  deleteReport
}