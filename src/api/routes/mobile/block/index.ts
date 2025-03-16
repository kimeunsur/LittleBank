import { ApiRouter } from "../../default"
import {blockCtrl} from "./blockCtrl"

const postBlock = new ApiRouter({
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
    200: { description: 'success'}   
  },
  handler: blockCtrl.postBlock
})

const getBlocksUsingPaging = new ApiRouter({
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
    200: { schema: 'responses/mobile/block/getBlocks'}    
  },
  handler: blockCtrl.getBlocksUsingPaging
})

const deleteBlock = new ApiRouter({
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
    200: { description: 'success'}   
  },
  handler: blockCtrl.deleteBlock
})

export {
  postBlock,
  getBlocksUsingPaging,
  deleteBlock
}