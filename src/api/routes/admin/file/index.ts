import { ApiRouter } from "../../default"
import {fileCtrl} from "./fileCtrl"

const getFilesUpload = new ApiRouter({
  name: 'upload',
  method: 'get',
  summary: 'Get pre-signed url',  
  description: `
    v1.0.0
    2024-08-02 11:00
    작성자 : 주지민
    ---------------------------------------

    >> 이미지파일 첨부(인증, 본문)를 위한 pre 사인키 발급
    - type: image, video, file, thumbnail(비디오 파일 업로드시)
    - mimeType : image/jpeg, image/png, video/mp4, ...

    - target :
      profile -> 프로필유저 프로필 이미지
      album -> 앨범 이미지
      chat -> 사진 채팅
      allowance -> 용돈 이미지(채팅)
      mission -> 미션 이미지(채팅)

    - num : 파일 개수
  `,
  tags: ['File'],
  isPublic: false,
  schema: 'common/file/getFilesUploadRequest',
  responses: {
    200: {schema: 'common/file/getFilesUploadResponse'}    
  },
  handler: fileCtrl.getFilesUpload
})

export {
  getFilesUpload
}