import {dashboardModel} from '../models/dashboard'
import {PoolConnection} from 'mysql'
import { settlementService } from './settlementService'

class DashboardService {
  async getDash(date:string): Promise<any> {
    const ret = await dashboardModel.findDash(date)
    const manual = await dashboardModel.findDashManual()

    ret.manualSettlementAmount = manual.manualSettlementAmount
    ret.manualSettlementCount = manual.manualSettlementCount

    return ret
  }

  async getBalance(): Promise<any> {
    const ret = await settlementService.getBankTransferBalance(1)   

    return ret
  }
}

export const dashboardService = new DashboardService()
