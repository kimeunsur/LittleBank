import {paymentModel} from '../models/payment'
import {profileModel} from '../models/profile'
import {tossManager} from '../libs/tossManager'
import {PoolConnection} from 'mysql'
import {v4 as uuidV4} from 'uuid'
import { settingModel } from '../models/setting'

class PaymentService {
  async postPaymentValid(profileId:number, options:{
    product:string,
    amount:number,
    orderId:string
  },connection?: PoolConnection): Promise<any> {
    const {isParent} = await profileModel.findOneProfileById(profileId)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    const adminSetting = await settingModel.findAdminSetting()
    if(!adminSetting) {throw new Error ('수수료 확인에 실패하였습니다. 다시 시도해주세요.')}

    const pointFee = adminSetting.data[0].pointFee ?? 0
    const totalAmount = Math.floor(options.amount * ((100 - pointFee) / 100))
    const paymentFee = options.amount - totalAmount

    const ret = await paymentModel.postPayment({profileId,paymentFee, ...options, paymentStatus:'pending'})
    if(!ret) {throw new Error('결제 기록에 실패하였습니다.')}   

    return {paymentId:ret}
  }

  async postPaymentConfirm(paymentId:number, profileId:number, options:{
    paymentKey:string,
    orderId:string,
    amount:number    
  },connection?: PoolConnection): Promise<void> {
    const {paymentKey, orderId, amount} = options
    if(amount < 200) {throw new Error ('최소 결제 금액은 200원 입니다.')}
    const {isParent, parentAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')} 

    const payment = await paymentModel.findOnePayment(paymentId, connection)
    if(payment.orderId !== orderId || payment.amount !== amount || !payment) {throw new Error ('결제 정보가 일치하지 않습니다.')}
    
    await tossManager.postPaymentConfirm({...options})
    const adminSetting = await settingModel.findAdminSetting()
    if(!adminSetting) {throw new Error ('수수료 확인에 실패하였습니다. 다시 시도해주세요.')}
    const pointFee = adminSetting.data[0].pointFee ?? 0
    
    const addAmount = Math.floor((amount * (100 - pointFee)) / 100)

    const paymentUpdate = await paymentModel.updatePayment(paymentId,{paymentKey,paymentStatus:'paid'}, connection)
    if(!paymentUpdate) {throw new Error('결제에 실패하였습니다.')}

    const ret = await profileModel.updateProfileById(profileId,{parentAmount:parentAmount+addAmount}, connection)
    if(!ret) {throw new Error('충전에 실패하였습니다.')}

    return ret   
  }

  async postPaymentCancel(paymentId:number, profileId:number, options:{
    cancelReason:string,
  },connection?: PoolConnection): Promise<void> {    
    const {isParent, parentAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}     

    const payment = await paymentModel.findOnePayment(paymentId, connection)
    if(!payment) {throw new Error ('결제 정보가 일치하지 않습니다.')}

    const pointFee = 1 // to do 관리자 수수료 비율 ㄱ
    const addAmount = payment.amount * pointFee

    if(parentAmount-addAmount < 0) {throw new Error ('이미 사용한 포인트 입니다.')}
    
    await tossManager.postPaymentCancel(payment.paymentKey, {...options})

    const paymentUpdate = await paymentModel.updatePayment(paymentId, {paymentStatus:'cancel',cancelReason:options.cancelReason}, connection)
    if(!paymentUpdate) {throw new Error('결제 취소에 실패하였습니다.')}

    const ret = await profileModel.updateProfileById(profileId,{parentAmount:parentAmount-addAmount}, connection)
    if(!ret) {throw new Error('결제 취소에 실패하였습니다.')}

    return ret
  }

  async getPayments(profileId: number, options:{page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await paymentModel.findAllAllPayments(profileId, options)
    
    return ret   
  }
  
  private getAmount(product:string) {
    let amount = 0

    switch (product) {
        case "1만원 충전":
            amount = 10000
            break
        case "3만원 충전":
            amount = 30000
            break
        case "5만원 충전":
            amount = 50000
            break
        default:
            throw new Error('유효하지 않은 상품입니다.')            
    }

    return amount
}

  private generateMerchantUid() {    
    const now = new Date()
    
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    const timestamp = `${year}${month}${day}`
    
    const uuid = uuidV4()
    
    return `${timestamp}${uuid}`
  }

  async getPaymentHistories(options:{search?: string, startTime?: string, endTime?: string, order: string, page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await paymentModel.findAllPaymentHistories(options)   
    
    return ret   
  }
}

export const paymentService = new PaymentService()
