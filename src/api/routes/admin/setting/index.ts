import { ApiRouter } from "../../default"
import {settingCtrl} from "./settingCtrl"

const getSetting = new ApiRouter({
  name: '',
  method: 'get',
  summary: '관리자 세팅 조회',
  description: `
    v1.0.0
    2024-08-14 14:00
    작성자 : 주지민
    ---------------------------------------    

  `,
  tags: ['Setting'],
  isPublic: false,  
  responses: {
    200: { schema: 'responses/admin/setting/getSetting'}   
  },
  handler: settingCtrl.getSetting
})

const putSetting = new ApiRouter({
  name: ':id',
  method: 'put',
  summary: '관리자 세팅 수정',
  description: `
    v1.0.0
    2024-08-14 14:00
    작성자 : 주지민
    ---------------------------------------   
    id -> adminSettingId
  `,
  tags: ['Setting'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/admin/setting/putSetting',
  responses: {
    200: { description: 'success'}   
  },
  handler: settingCtrl.putSetting
})

export {
  getSetting,
  putSetting
}