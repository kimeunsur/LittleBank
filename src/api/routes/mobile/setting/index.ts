import { ApiRouter } from "../../default"
import {settingCtrl} from "./settingCtrl"

const getSetting = new ApiRouter({
  name: '',
  method: 'get',
  summary: '세팅 조회',
  description: `
    v1.0.1
    2024-10-29 10:00
    작성자 : 주지민    
    ---------------------------------------    
    res 추가
    pointFee -> 충전 수수료(%), number
    depositFee -> 즉시 입금 수수료(%), number
    depositFeeMin -> 최소 즉시 입금 금액(원), integer
    sellingFee -> 앨범 판매 수수료(%), number
    sellingFeeMin -> 최소 앨범 판매 금액(원), integer

    v1.0.0
    2024-10-08 11:50
    작성자 : 윤재상
    ---------------------------------------    

  `,
  tags: ['Setting'],
  isPublic: true,  
  responses: {
    200: { schema: 'responses/mobile/setting/getSetting'}   
  },
  handler: settingCtrl.getSetting
})

export {
  getSetting,
}