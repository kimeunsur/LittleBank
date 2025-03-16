import {Request} from 'express'

declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

declare global {
  declare interface IRequest extends Request {
    id?: number
    user: any
    userId: number
    profileId: number
    adminId: number
    guestId: string
    role: string
    clientIp: string
    useragent: string
    file?: any
    options: {[p: string]: any}
    deviceId?: string | string[]
  }

  declare interface Dictionary {
    [p: string]: any
  }

  declare interface IResponseList<T> {
    parentId?: number
    replyId?: number
    id?: number
    data?: T[]
    total?: number
    comments?: T[]
  }

  declare interface IRequestList {
    userId?: number
    page: number
    perPage: number
  }
}
