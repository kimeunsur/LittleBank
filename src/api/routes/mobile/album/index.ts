import { ApiRouter } from "../../default"
import {albumCtrl} from "./albumCtrl"

const postAlbumChat = new ApiRouter({
  name: '',
  method: 'post',
  summary: '앨범 판매(아이)',
  description: `
    v1.0.0
    2024-07-31 14:00
    작성자 : 주지민
    ---------------------------------------
    required: 
    "chatRoomId" -> integer 채팅방id
    "albumChat" -> string 앨범 내용
    "albumAmount" -> integer 앨범 가격
    "albumImages" -> [string, ...] 앨범 사진 배열
  `,
  tags: ['Album'],
  isPublic: false,  
  schema: 'requests/mobile/album/postAlbumChat',
  responses: {
    200: { description: 'success'}   
  },
  handler: albumCtrl.postAlbumChat
})

const getAlbumChat = new ApiRouter({
  name: ':id',
  method: 'get',
  summary: '앨범 조회',
  description: `
    v1.0.0
    2024-08-01 16:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceAlbumId    

    v1.0.0
    2024-11-29 15:00
    작성자 : 윤재상
    ---------------------------------------    
    albumStatus -> enum('complete','pending')
  `,
  tags: ['Album'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { schema: 'responses/mobile/album/getAlbumChat'}   
  },
  handler: albumCtrl.getAlbumChat
})

const putAlbumChatComplete = new ApiRouter({
  name: 'complete/:id',
  method: 'put',
  summary: '앨범 이체',
  description: `
    v1.0.0
    2024-07-31 15:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceAlbumId

  `,
  tags: ['Album'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: albumCtrl.putAlbumChatComplete
})

export {  
  postAlbumChat,
  getAlbumChat,
  putAlbumChatComplete
}