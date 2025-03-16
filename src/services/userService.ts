import {profileModel} from '../models/profile'
import {PoolConnection} from 'mysql'

class UserService {
  async getUsers(options:{search?:string, order?:string,page: number, perPage: number},connection?: PoolConnection): Promise<void> {   
    const ret = await profileModel.findAllProfilesForAdmin(options)
    
    return ret   
  }

  async getUser(userId: number, connection?: PoolConnection): Promise<any> {  
    const ret = await profileModel.findFamilyForAdmin(userId)    
    
    return ret
  }
}

export const userService = new UserService()
