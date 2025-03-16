import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken'
import fs from 'fs'

const privateKey = fs.readFileSync(`${__dirname}/private.pem`)
const publicKey = fs.readFileSync(`${__dirname}/public.pem`)

let ACCESS_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50
let REFRESH_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50
if ('production' == process.env.NODE_ENV) {
  ACCESS_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50
}

async function createToken(payload: Dictionary, options: SignOptions, secret: Secret = privateKey): Promise<string> {
  try {
    return await jwt.sign(payload, secret, options)
  } catch (e) {
    throw e
  }
}

async function decodeToken(token: string, options: VerifyOptions, secret: Secret = publicKey): Promise<any> {
  try {
    return await jwt.verify(token, secret, options)
  } catch (e) {
    throw new Error('invalid_token')
  }
}

async function decodeTokenRefresh(token: string, options: VerifyOptions, secret: Secret = publicKey): Promise<any> {
  try {
    return await jwt.verify(token, secret, options)
  } catch (e) {
    throw new Error('invalid_refresh_token')
  }
}

async function createAccessToken(id:number, reqRole:string): Promise<string> {
  try {    
    const payload = { sub: id, reqRole}
    return await createToken(payload, {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_EXPIRE_TIME
    })
  } catch (e) {
    throw e
  }
}

async function createRefreshToken(profileId: any, tokenSecret: Secret): Promise<string> {
  try {
    const payload = {
      sub: profileId
    }    
    return await createToken(payload, { algorithm: 'HS256', expiresIn: REFRESH_TOKEN_EXPIRE_TIME }, tokenSecret)
  } catch (e) {
    throw e
  }
}

export {
  createToken,
  decodeToken, 
  decodeTokenRefresh,
  createAccessToken,
  createRefreshToken
}
