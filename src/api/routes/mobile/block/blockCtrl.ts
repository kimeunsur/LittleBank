import {Response} from "express"
import { blockService } from "../../../../services/blockService"
import { db } from "../../../../loaders"

class BlockCtrl {
  async postBlock(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const {blockProfileId} = req.options
      await blockService.postBlock(profileId, blockProfileId, connection)
      await db.commit(connection)
      res.status(200).send('success')
    } catch (e) {
      if (connection) {
        await db.rollback(connection)
      }
      e.status = 477
      next(e)
    }
  }

  async getBlocksUsingPaging(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await blockService.getBlocksUsingPaging(profileId, {page, perPage})
      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async deleteBlock(req: IRequest, res: Response, next: Function): Promise<any> {   
    try {
      const profileId = req.profileId
      const {id: blockProfileId} = req.options
      await blockService.deleteBlock(profileId, blockProfileId)

      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const blockCtrl = new BlockCtrl()