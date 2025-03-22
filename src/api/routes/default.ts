import { Router } from 'express'

const router=Router()
interface IApiRouter {
  coerceTypes?: string
  contentType?: string
  description?: string
  fileNames?: string[]
  handler: Function
  isPublic?: boolean
  method?: string
  middlewares?: Function[]
  name: string
  parameters?: any[]
  paths?: string[]
  responses: Dictionary
  roles?: string[]
  schema?: string
  summary?: string
  tags?: string[]
  deprecation?: boolean
}

export class ApiRouter {
  coerceTypes: string
  contentType: string
  description: string
  fileNames: string[]
  handler: Function
  isPublic: boolean
  method: string
  middlewares: Function[]
  name: string
  parameters: any[]
  paths: string[]
  responses: Dictionary
  roles: string[]
  schema: string
  summary: string
  tags: string[]
  deprecation: boolean

  constructor(object: IApiRouter) {
    this.name = object.name
    this.method = object.method || 'get'
    this.summary = object.summary || ''
    this.description = object.description || ''
    this.tags = object.tags || []
    this.paths = object.paths
    this.schema = object.schema
    this.handler = object.handler
    this.parameters = object.parameters || []
    this.responses = object.responses || {200: {description: 'success'}}
    this.contentType = object.contentType || 'application/json'
    this.middlewares = object.middlewares || []
    this.isPublic = object.isPublic || false
    this.deprecation = object.deprecation || false
    this.roles = object.roles || []
    this.fileNames = object.fileNames || []
    this.coerceTypes = object.coerceTypes ? object.coerceTypes : 'array'
  }
}
function getController(path: string, obj: any, router: Router): void {
  if (typeof obj === 'function') {
    router.use(path, obj)
  } else {
    Object.keys(obj).forEach((key) => {
      const ctrl = obj[key]
      if (ctrl instanceof ApiRouter) {
        let url
        if (typeof ctrl.name === 'string') {
          url = ctrl.name.length > 0 ? `${path}/${ctrl.name}` : path
        } else {
          url = `${path}/${key}`
        }
        
        console.log(`✅ Registering API: ${ctrl.method.toUpperCase()} ${url}`) // ✅ 라우트 등록 로그 추가

        if (!ctrl.handler) throw new Error(`${url} handler is required`)
        const args = [ctrl.handler]
        router[ctrl.method](url, args)
      }
    })
  }
}
export default router