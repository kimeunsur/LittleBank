export = {
  host: 'https://dev-be.siwonpp.co.kr',
  redis: {
    host: 'redis',
    port: 6379
  },
  mongodb: {
    agenda: 'mongodb://mongodb/agenda'
  },
  aws: {
    secrets: {
      mysql: 'dev-littlebank-mysql'
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
    tempBucket: 'littlebank-temp',
    cloudfront: 'https://dvitu87y8yjya.cloudfront.net',
    bucket: 'dev.littlebank'
  },
  slack: {
    isSend: true
  }
}
