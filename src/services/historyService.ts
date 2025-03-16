import {historyModel} from '../models/history'
import { paymentModel } from '../models/payment'
import {profileModel} from '../models/profile'
import {PoolConnection} from 'mysql'

class HistoryService {
  async getAllowanceHistories(profileId: number, options:{date:string, page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await historyModel.findAllAllowanceHistories(profileId, options)
    const {balance} = await historyModel.sumAllAllowanceHistories(profileId)
    ret.balance = balance || 0
    
    return ret   
  }

  async getAllowanceHistoriesParentList(profileId: number, options:{date:string, page: number, perPage: number},connection?: PoolConnection): Promise<any> {    
    const {userId} = await profileModel.findOneProfileById(profileId)
    if (!userId) {throw new Error("존재하지 않는 계정입니다.")}
    const family = await historyModel.findFamilyProfileWithAmount(userId, profileId, options.date)
    const buddy = await historyModel.findBuddyProfileWithAmount(profileId, options.date)
    const data = [...family,...buddy]
    const total = data.length
    
    return {data : this.paginate(data, total, options.page, options.perPage), total}
  }

  private paginate(data, total, page, perPage) {    
    const totalPages = Math.ceil(total / perPage)
    const currentPage = Math.min(page, totalPages)
    const start = (currentPage - 1 ) * perPage
    const end = start + perPage   

    return  data.slice(start, end)
  }  

  async getAllowanceHistoriesAdmin(options:{startTime?: string, endTime?: string, order: string, page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await historyModel.findAllAllowanceHistoriesAdmin(options)
    
    return ret   
  }

  async getAllowanceAlbumHistoriesAdmin(options:{startTime?: string, endTime?: string, order: string, page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await historyModel.findAllAllowanceAlbumHistoriesAdmin(options)
    
    return ret   
  }

}

export const historyService = new HistoryService()
