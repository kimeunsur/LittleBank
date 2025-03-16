import { ApiRouter } from "../../default"
import {dashboardCtrl} from "./dashboardCtrl"

const getDash = new ApiRouter({
  name: ':param',
  method: 'get',
  summary: '대시보드 조회',
  description: `
    v1.0.0
    2024-10-17 13:00
    작성자 : 주지민
    ---------------------------------------

    param -> string ex) 2024-08

  `,
  tags: ['Dash'],
  isPublic: false,
  paths: ['common/stringPath'],
  responses: {
    200: { schema: 'responses/admin/dashboard/getDash'}   
  },
  handler: dashboardCtrl.getDash
})

const getBalance = new ApiRouter({
  name: 'balance/amount',
  method: 'get',
  summary: '리틀뱅크 가상계좌 조회',
  description: `
    v1.0.0
    2024-12-02 15:30
    작성자 : 주지민
    ---------------------------------------    

  `,
  tags: ['Dash'],
  isPublic: false,  
  responses: {
    200: { schema: 'responses/admin/dashboard/getBalance'}   
  },
  handler: dashboardCtrl.getBalance
})

export {
  getDash,
  getBalance
}