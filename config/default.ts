import * as dotenv from 'dotenv'

dotenv.config()

export = {
  host: 'http://localhost:4000',
  database: {
    database: 'littlebank',
    connectionLimit: 20,
    timezone: 'Asia/Seoul',
    charset: 'utf8mb4',
    debug: []
  },
  mongodb: {
    agenda: 'mongodb://127.0.0.1:27017/agenda'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  swagger: {
    id: 'alphabase',
    password: 'alphabase4u'
  }, 
  log: {
    group: 'dev-littlebank',
    stream: 'error'
  },
  aws: {
    secrets: {
      mysql: 'dev-littlebank-mysql',
      iamport: 'littlebank-iamport',
      toss: 'littlebank-toss',
      firebase: 'littlebank-firebase',
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',  
    cloudfront: 'https://dvitu87y8yjya.cloudfront.net',
    bucket: 'dev.littlebank'
  },
  slack: {
    isSend: true
  }
}
