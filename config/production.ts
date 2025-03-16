export = {
  host: 'https://prod-be.siwonpp.co.kr',
  database: {
    database: 'littlebank',
    connectionLimit: 100,
    timezone: 'Asia/Seoul',
    charset: 'utf8mb4',
    debug: []
  },
  redis: {
    host: 'redis',
    port: 6379
  },
  mongodb: {
    agenda: 'mongodb://mongodb/agenda'
  },
  log: {
    group: 'prod-littlebank',
    stream: 'error'
  },
  aws: {
    secrets: {
      mysql: 'prod-littlebank-mysql',
      iamport: 'littlebank-iamport'
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2', 
    cloudfront: 'https://d2vg8vi7rvph6d.cloudfront.net',
    bucket: 'prod.littlebank'
  },
  slack: {
    isSend: true
  }
}