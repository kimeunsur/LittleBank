import * as aws from './aws'
import * as logger from './logger'
import * as mysql from './mysql'
import * as firebase from './firebase'
import * as mailer from './mailer'
// import * as sms from './sms'
import express from './express'
import { redisLoader } from './redisLoader'

export async function init(): Promise<void> {
  await Promise.all([
    mysql.init(), 
    redisLoader.init(),
    firebase.init(),
    // sms.init(),
  ])
}

export {
  aws,
  logger,
  mysql as db,
  // mailer,
  express,
  // sms
}