import express from 'express'
import path from 'path'
import helmet from 'helmet'
import config from 'config'
import session, {SessionOptions} from 'express-session'
import redis from 'redis'
import connectRedis from 'connect-redis'
import Agendash from 'agendash'
import cors from 'cors'
import momentTimezone from 'moment-timezone'

//multer setting
import multer from 'multer'
var upload = multer({ storage: multer.memoryStorage() })

import {assignId, morgan} from '../api/middlewares'
import {logger} from '../loaders'
import routes from '../api/routes'
import {agenda} from '../jobs/mission'
import { promisify } from 'util'

const app = express()

const RedisStore = connectRedis(session)
const redisClient = redis.createClient(config.get('redis'))

/**
 * redis가 연결되었을 때까지 기다리도록 한다.
 * 이벤트 형식은 Promise를 반환하지 않기 때문에 반환하도록 의도적으로 만들어줍니다.
 */
const redisClientReady = promisify((callback) => {
  redisClient.on('ready', callback)
})
;(async () => {
  await redisClientReady()
  logger.debug('Redis connected')
})()

const sess: SessionOptions = {
  name: 'littlebank.sid',
  secret: 'w)fJnqw<4G8g~w?f',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  store: new RedisStore({client: redisClient}),
  cookie: {
    httpOnly: true,
    sameSite: true,
    maxAge: 60 * 60 * 2 * 1000
  }
}

if (['development', 'production'].indexOf(process.env.NODE_ENV) > -1) {
  sess.cookie.secure = true
}

if (['development'].indexOf(process.env.NODE_ENV) > -1) {
  sess.cookie.sameSite = 'none'
}


const baseSessionMiddleware = session(sess)
const adminSessionMiddleware = session({
  ...sess,
  name: 'admin',
})

app.use(['/api/admin', '/api/swagger/admin'], adminSessionMiddleware)

app.use(baseSessionMiddleware)

app.enable('trust proxy')
app.set('etag', false)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '../public')))

const whitelist = [
  'http://localhost:3000',    
  'http://siwonpp.co.kr',
  'https://siwonpp.co.kr',
  'https://www.siwonpp.co.kr',
  'https://dev-admin.siwonpp.co.kr',
  'https://admin.siwonpp.co.kr',
  'https://dev-be.siwonpp.co.kr',
  'https://prod-be.siwonpp.co.kr'  
]

const corsOptionsDelegate = function (req, callback) {
  let corsOptions
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {credentials: true, origin: true}
  } else {
    corsOptions = {origin: false}
  }
  callback(null, corsOptions)
}

app.use(cors(corsOptionsDelegate))
app.use(assignId)
app.use(
  morgan({
    skip: (req, res) =>
      req.originalUrl.includes('/swagger') || req.originalUrl.includes('/health') || res.statusCode > 300,
    stream: logger.infoStream
  })
)
app.use(
  morgan({
    skip: (req, res) => res.statusCode < 400,
    stream: logger.errorStream
  })
)

app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({extended: true}))
app.use(helmet())

app.get('/health', (req, res) => res.status(200).end())
app.use('/dash', Agendash(agenda))

//multer router 처리
app.post('/api/mobile/log/click', upload.single('img'), (req, res, next)=> {
  next()
})

routes(app)
momentTimezone.tz.setDefault('Asia/Seoul')

export default app

export const expressManager = {
  redisClient 
}

app.use((req, res, next) => {
  console.log(`[ROUTE HIT] ${req.method} ${req.url}`)
  next()
})

// ✅ 현재 등록된 모든 라우트 출력
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`✅ Registered Route: ${r.route.path}`)
  }
})
console.log("🔍 Redis Config:", config.get('redis'));