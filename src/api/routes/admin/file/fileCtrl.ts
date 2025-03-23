import { Response } from "express"
import { aws } from "../../../../loaders"
import mime from "mime-types"
import { v4 as uuid } from "uuid"

class FileCtrl{
  async getFilesUpload(req:IRequest, res: Response, next: Function): Promise<any> {
    try {
      //type; 파일 종류 mimetype; 파일 Mime 타입 imageuploadtarget; 업로드 목적/위치 num; 발급받을 url 개수
      const {mimeType, type, imageUploadTarget, num} = req.options
      const extensions = mime.extensions[mimeType]
      if(type === 'image' && !mimeType.startsWith('image/')) {throw new Error("bad_mimetype")}
      if(!extensions) {throw new Error("bad_mimetype")}
      
      const result = []

      for (let i = 0; i < num; i++) {
        const key = `${uuid()}.${extensions[0]}`

        result.push(aws.generatePreSignedUrl(key, type, mimeType, imageUploadTarget))
      }
      
      res.status(200).json(result)
    } catch (e) {
      e.status = 477    
      next(e)
    }
  }
}

export const fileCtrl = new FileCtrl()