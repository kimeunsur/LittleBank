import {adminModel} from '../models/admin'
import {code as Code} from '../libs'
import {PoolConnection} from 'mysql'
import { settingModel } from '../models/setting'


class AdminService {
  async findOneAdminById(adminId: number): Promise<any> {    
      const ret = await adminModel.findOneAdminById(adminId)
      if(!ret) throw new Error('다시 로그인 해주세요.')
      return ret
  }

  async postAdmin(options: {adminName:string ,email: string; password: string}): Promise<any> {
    const check = await adminModel.findOneAdminByEmail(options.email)
    if(check) throw new Error ('이미 존재하는 아이디 입니다.')
    const ret = await adminModel.createAdmin(options)
    if(!ret) throw new Error('관리자 생성에 실패하였습니다.')
    return ret
  } 

  async postAuth(options: {email: string, password: string}): Promise<any> {  
      const ret = await adminModel.findOneAdminByEmail(options.email)
      if (!ret) throw new Error('로그인 정보가 올바르지 않습니다.')
      if(ret.password !== options.password) {throw new Error('로그인 정보가 올바르지 않습니다.')}
      
      return ret    
    }

    async getSetting(connection?: PoolConnection): Promise<any> {  
      const ret = await settingModel.findAdminSetting(connection)    
      if (!ret) {
        throw new Error('설정 정보를 불러오는데 실패하였습니다.')
      }
      return ret
    }

    async putSetting(adminSettingId: number,    
      options:{
        pointFee?:number,
        depositFee?:number,
        depositFeeMin?:number,
        sellingFee?:number,
        sellingFeeMin?:number,
        url?: string,
        },connection?: PoolConnection
      ): Promise<any> {      
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null))
        
        const ret = await settingModel.updateAdminSetting(adminSettingId, options)
        if (!ret) {throw new Error('수정에 실패하였습니다.')}
        
        return ret   
    }
}

export const adminService = new AdminService()
