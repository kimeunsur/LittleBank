import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class PaymentModel{
  async postPayment(options:{
    profileId: number,
    product:string,
    amount:number,
    paymentFee:number,
    orderId:string
    paymentStatus: string,},
    connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.payment, {...options}]
      })
      return insertId
  }

  async findOnePayment(paymentId: number, connection?: PoolConnection): Promise<any> { 
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.payment, {paymentId}]
    })

    return row 
  }

  async updatePayment(
    paymentId: number,
    options: {
      paymentKey?: string,
      paymentStatus?:string,
      cancelReason?:string
    },
    connection?: PoolConnection
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.payment, {...options}, {paymentId}]
      })

      return affectedRows  
  }

  async findAllAllPayments(profileId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          *         
        FROM
          ??                
        WHERE
          ? AND isDeleted != 1 AND paymentStatus != 'pending'
        ORDER BY
          createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.payment, {profileId}]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          ? AND isDeleted != 1 AND paymentStatus != 'pending'
      `,
      values: [TableName.payment, {profileId}]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllPaymentHistories(options:{search?: string, startTime?: string, endTime?: string, order: string, page: number, perPage: number}, connection?: PoolConnection): Promise<any> {
    const {search, startTime, endTime, order, page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          pm.paymentId,
          u.email,
          u.userId,
          p.name,
          p.profileId,
          pm.amount,
         (pm.amount - pm.paymentFee) AS realAmount,
          pm.paymentFee,
          pm.paymentStatus,
          pm.createdAt
        FROM
          ?? pm
        JOIN
          ?? p ON p.profileId = pm.profileId
        JOIN
          ?? u ON u.userId = p.userId
        WHERE
          pm.isDeleted != 1 AND pm.paymentStatus != 'pending'
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
          ${startTime && endTime ? `AND (pm.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}          
        ORDER BY
          pm.createdAt ${order}
        LIMIT
          ${perPage * page - perPage}, ${perPage}
      `,
      values: [TableName.payment, TableName.profile, TableName.user]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(pm.paymentId) AS cnt           
        FROM
          ?? pm
        JOIN
          ?? p ON p.profileId = pm.profileId
        JOIN
          ?? u ON u.userId = p.userId
        WHERE
          pm.isDeleted != 1 AND pm.paymentStatus != 'pending'
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
          ${startTime && endTime ? `AND (pm.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}         
      `,
      values: [TableName.payment, TableName.profile, TableName.user]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }
  
}

export const paymentModel = new PaymentModel()