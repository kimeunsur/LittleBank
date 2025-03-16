import {Response} from "express"
import {albumService} from '../../../../services/albumService'
import {db} from "../../../../loaders"

class AlbumCtrl {
  async postAlbumChat(req: IRequest, res: Response, next: Function): Promise<any> {    
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const {chatRoomId, albumChat, albumAmount, albumImages} = req.options
      await albumService.postAlbumChat(chatRoomId, {profileId, albumChat, albumAmount}, albumImages, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async getAlbumChat(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const allowanceAlbumId = req.options.id
      const ret = await albumService.getAlbumChat(allowanceAlbumId)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putAlbumChatComplete(req: IRequest, res: Response, next: Function): Promise<any> {    
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceAlbumId = req.options.id      
      await albumService.putAlbumChatComplete(profileId, allowanceAlbumId, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }
}

export const albumCtrl = new AlbumCtrl()