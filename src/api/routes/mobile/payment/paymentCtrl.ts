import {Response} from "express"
import {paymentService} from '../../../../services/paymentService'
import {db} from "../../../../loaders"

class PaymentCtrl {
  async postPaymentValid(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const {product, amount, orderId} = req.options
      const ret = await paymentService.postPaymentValid(profileId, {product, amount, orderId})      
      
      res.status(200).json(ret)
      // res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
  
  async postPaymentConfirm(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const paymentId = req.options.id
      const {paymentKey, orderId, amount} = req.options
      await paymentService.postPaymentConfirm(paymentId, profileId, {paymentKey, orderId, amount}, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async getPayments(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await paymentService.getPayments(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async postPaymentCancel(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const paymentId = req.options.id
      const {cancelReason} = req.options
      await paymentService.postPaymentCancel(paymentId, profileId, {cancelReason}, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }
}

export const paymentCtrl = new PaymentCtrl()