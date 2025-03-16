import express from 'express'
import swaggerUI from 'swagger-ui-dist'
import basicAuth from 'express-basic-auth'
import config from 'config'
import generator from './generator'
import pkg from '../../../../package.json'

const swaggerConfig: Dictionary = config.get('swagger')
const router = express.Router()

if (process.env.NODE_ENV !== 'production') {
  const swaggerFile = 'doc.json'

  const mobileDoc = generator('mobile')
  mobileDoc.info.title = `${mobileDoc.info.title} mobile user api`

  const adminDoc = generator('admin')
  adminDoc.info.title = `${adminDoc.info.title} admin api`
  delete adminDoc.components.securitySchemes

  const description = `\n - [${mobileDoc.info.title}](/api/swagger)\n - [${adminDoc.info.title}](/api/swagger/admin)\n`
  
  mobileDoc.info.description += description
  adminDoc.info.description += description
 
  router.use(
    basicAuth({
      users: {[swaggerConfig.id]: swaggerConfig.password},
      challenge: true,
      realm: `${pkg.name} ${process.env.NODE_ENV}`
    })
  )
  router.use(
    '/',
    (req, res, next) => {
      if (req.url === '/') {
        return res.redirect(`?url=${swaggerFile}`)
      }
      next()
    },
    express.static(`${__dirname}/../../../../node_modules/swagger-ui-dist`)
  )

  router.route(`/${swaggerFile}`).get((req, res, next) => {
    try {
      res.status(200).json(mobileDoc)
    } catch (e) {
      next(e)
    }
  })

  router.use(
    '/mobile',
    (req, res, next) => {
      if (req.url === '/') {
        return res.redirect(`?url=${swaggerFile}`)
      }
      next()
    },
    express.static(swaggerUI.absolutePath())
  )

  router.route(`/mobile/${swaggerFile}`).get((req, res, next) => {
    try {
      res.status(200).json(mobileDoc)
    } catch (e) {
      next(e)
    }
  })

  router.use(
    '/admin',
    (req, res, next) => {
      if (req.url === '/') {
        return res.redirect(`?url=${swaggerFile}`)
      }
      next()
    },
    express.static(swaggerUI.absolutePath())
  )

  router.route(`/admin/${swaggerFile}`).get((req, res, next) => {
    try {
      res.status(200).json(adminDoc)
    } catch (e) {
      next(e)
    }
  })  
} 

export default router