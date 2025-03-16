import {serializeError} from 'serialize-error'
import {Response} from 'express'
import {aws, logger} from '../../loaders'

interface ErrorResponse {
  message?: string
  stack?: any
}

export function notFound(req: IRequest, res: Response, next?: Function): void {
  res.status(404).send()
}

export function errorHandler(e: Dictionary, req: IRequest, res: Response, next?: Function): void {
  const status: number = e.status || 500
  const error = {
    path: req.route.path,
    method: req.method,
    data: req.options,
    status: e.status,
    message: e.message,
    stack: e.stack
  }

  let errorMessage = e.message || '미확인 오류입니다.'

  if (!(error.path === '/mobile/auth/refresh' && error.status === 401)) {
    aws.putErrorLog(error)
  }

  delete e.status

  const response: ErrorResponse = {}
  if (e) {
    if (status >= 500) logger.fatal(e, {reqId: req.id})
    const error = serializeError(e) || {}
    response.message = error.message
    if (process.env.NODE_ENV !== 'production') {
      response.stack = error.stack
    }
    if (process.env.NODE_ENV === 'test' && status < 500) {
      logger.error(e)
    }
  }

  // res.status(status).json(response)

  if(status === 477){
    res.status(status).send(errorMessage)
  } else {
    res.status(status).json(response)
  } 
}
