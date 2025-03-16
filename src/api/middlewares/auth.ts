import {Response} from 'express'
import {jwt as JWT, code} from '../../libs'

function user(roles: string[]) {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {      
      const {authorization} = req.headers           
      if (authorization && authorization.split(' ')[0] === 'Bearer') {
        if (authorization.split(' ')[1] === 'test1111') { 
          req.profileId = 1
          next()
        } else if (authorization.split(' ')[1] === 'test2222') {
          req.profileId = 2
          next()
        } else if (authorization.split(' ')[1] === 'test3333') { 
          req.profileId = 8
          next()
        } else if (authorization.split(' ')[1] === 'test4444') { 
          req.profileId = 3
          next()
        } else if (authorization.split(' ')[1] === 'test5555') { 
          req.profileId = 5
          next()
        } else if (authorization.split(' ')[1] === 'test6666') { 
          req.profileId = 37
          next()
        } else if (authorization.split(' ')[1] === 'test9999') { 
          req.profileId = 7
          next()
        } else if (authorization.split(' ')[1] === 'test8888') { 
          req.profileId = 15
          next()
        } else {
          const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})          
          if (jwtToken.reqRole ==='profile') {
            req.profileId = jwtToken.sub
            next()
          } else if(jwtToken.reqRole ==='user'){
            req.userId = jwtToken.sub                 
            next()
          }
        }
      } else {
        res.status(401).json({message: 'invalid_token'})
      }
    } catch (e) {    
      res.status(401).json({message: 'invalid_token'})      
    }
  }
}

function guest(roles: string[]) {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {
      const deviceId = await getDeviceIdFromHeader(req)
      req.deviceId = deviceId
      const {authorization} = req.headers
      if (authorization && authorization.split(' ')[0] === 'Bearer') {
        const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})
        if (jwtToken.sub) {
          req.profileId = jwtToken.sub
          next()
        }
      } else {
        const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : ''
        req.guestId = code.hashSHA256(ip)
        req.profileId = null
        next()
      }
    } catch (e) {
      const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : ''
      req.guestId = code.hashSHA256(ip)
      next()
    }
  }
}

function admin() {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {
      const deviceId = await getDeviceIdFromHeader(req)
      req.deviceId = deviceId

      if (req.session && req.session.adminId) {
        if (req.session.type === 'admin') {          
          return next()
        }
      }
      res.status(401).json({message: 'invalid_session'})
    } catch (e) {
      res.status(401).json({message: 'invalid_session'})
    }
  }
}

async function getDeviceIdFromHeader(req: IRequest): Promise<string | string[]> {
  try {
    const deviceid = req.headers.deviceid

    if (deviceid) {
      return deviceid
    } else return null
  } catch (e) {
    return null
  }
}

export {user, guest, admin}
