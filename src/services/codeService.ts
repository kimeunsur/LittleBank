import { PoolConnection } from "mysql"
import { codeModel } from "../models/code"

class CodeService {
  async getCodeBank(connection?: PoolConnection): Promise<any> {
    return await codeModel.findAll()
  }
}

export const codeService = new CodeService()