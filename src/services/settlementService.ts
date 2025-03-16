import {settlementModel} from '../models/settlement'
import {profileModel} from '../models/profile'
import {PoolConnection} from 'mysql'
import { adminService } from './adminService'
import { logger } from '../loaders'
import axios from 'axios'
import { profileService } from './profileService'
import XLSX from 'xlsx'
import { historyModel } from '../models/history'

class SettlementService {
  // dev
  private DEV_URL = 'https://dev2.coocon.co.kr:8443/sol/gateway/vapg_wapi.jsp'
  private PROD_URL = 'https://apigw.coocon.co.kr/sol/gateway/vapg_wapi.jsp'

  private URL = process.env.NODE_ENV === 'production' ? this.PROD_URL : this.DEV_URL

  private DEV_SECR_KEY = '3CWEfCSY2GRNwy52RfzU' // test
  private PROD_SECR_KEY = '3CWEfCSY2GRNwy52RfzU' // test
  private SECR_KEY = process.env.NODE_ENV === 'production' ? this.PROD_SECR_KEY : this.DEV_SECR_KEY
  
  private TRT_INST_CD = '08948191' // 서비스 취급기관 코드
  private BANK_CD = '089' // 케이뱅크
  private WDRW_ACCT_NO = '70037000000278'

  /**
   * 자동 정산을 진행합니다.
   */
  private async processAutoSettlement(profileId: number, settlementAmount: number, insertId: number) {
    const profile = await profileService.getProfileInfo(profileId)
    await this.getBankTransferName(profile, settlementAmount, insertId)
    await this.processBankTransfer(profile, settlementAmount, insertId)
  }

  /**
   * 예금주명 조회
   * @returns 
   */
  private async getBankTransferName(profile: any, settlementAmount: number, insertId: number) {
    let {bankCode, bankAccount} = profile

    const BANK_TRANSFER_RESULT_KEY = '6110'
    const TRSC_SEQ_NO = this.generateTRSCSeqNo(insertId)
    let body: any

    if (process.env.NODE_ENV === 'production') {
      body = {
        "SECR_KEY": this.SECR_KEY,
        "KEY": BANK_TRANSFER_RESULT_KEY,
        "TRT_INST_CD": this.TRT_INST_CD,
        "BANK_CD": this.BANK_CD,
        "TRSC_SEQ_NO": TRSC_SEQ_NO,
        "RCV_BNK_CD": bankCode,
        "RCV_ACCT_NO": bankAccount,
        "TRSC_AMT": settlementAmount
      }
    } else {
      body = {
        "SECR_KEY": this.SECR_KEY,
        "KEY": BANK_TRANSFER_RESULT_KEY,
        "TRT_INST_CD": this.TRT_INST_CD,
        "BANK_CD": this.BANK_CD, // test
        "TRSC_SEQ_NO": TRSC_SEQ_NO,
        "RCV_BNK_CD": bankCode,
        "RCV_ACCT_NO": bankAccount,
        "TRSC_AMT": "5000"
      }
    }

    const headers = {
      'content-type': 'application/json'
    }

    const { data } = await axios.post(
      this.URL,
      body,
      {
        headers
      }
    )

    // test
    logger.info('name res ' + JSON.stringify(data, null, 2))

    const { RESP_CD, RESP_MSG } = data
    if (!RESP_CD) { // 응답 자체가 실패했을 때
      throw new Error('은행사와의 통신이 원활하지 않습니다.')
    }
    if (RESP_CD !== '0000') {
      if (RESP_CD === '9915') { // '은행 코드가 미입력 되었습니다'라는 메시지이므로 모호하여 변경
        throw new Error('계좌 정보가 입력되어 있지 않습니다.')
      } else if (RESP_CD === '247') { // 계좌 번호 길이 등이 맞지 않을 때 '기타 오류입니다'이므로 모호하여 변경
        throw new Error('계좌 정보가 일치하지 않습니다.')
      } else if ((RESP_CD[0] !== 'P' && RESP_CD.length === 3) || // 은행오류코드 중 운영사 송금 계좌와 관련 없는 오류
        (RESP_CD[0] === '9' && RESP_CD.length === 4)) { // API 오류코드이므로 유저의 입력값이 잘못 되었을 때 등의 오류
        throw new Error(RESP_MSG)
      } else {
        throw new Error('자동 정산에 실패하였습니다. 운영자에게 문의해 주시기 바랍니다.  error code: 1')
      }
    }
    return data
  }

  /**
   * 입금이체를 진행합니다.
   * 
   * body에 들어갈 프로퍼티는 다음과 같습니다.
    {
      "SECR_KEY": "고객사인증키값", // 20 고객사 인증키 값
      "KEY": "6120", // 40 API 키값
      "TRT_INST_CD": "취급기관코드8자리", // 8 이용신청시 발급된 취급기관코드
      "BANK_CD": "039", // 3 취급기관코드에 연동된 은행 코드
      "TRSC_SEQ_NO": "000000000005", // 12 거래일별 고유번호
      "RCV_BNK_CD": "020", // 3 입금계좌 은행코드
      "RCV_ACCT_NO": "1234567890", // 16 입금 대상 계좌번호
      "WDRW_ACCT_NO": "0987654321", // 16 출금 계좌번호
      "TRSC_AMT": "5000", // 13 입금금액
      "WDRW_ACCT_NM": "홍길동" // 20 의뢰인명, 미설정 시 기본적으로 등록된 의뢰인명으로 처리
    }
   */
  private async processBankTransfer(profile: any, settlementAmount: number, insertId: number) {
    let {
      // name,  // 유저 이름
      bankCode, 
      bankAccount
    } = profile
    const name = '리틀뱅크'

    const BANK_TRANSFER_KEY = '6120'
    const TRSC_SEQ_NO = this.generateTRSCSeqNo(insertId)

    let body: any
    if (process.env.NODE_ENV === 'production') {
      body = {
        "SECR_KEY": this.SECR_KEY, // 20 고객사 인증키 값
        "KEY": BANK_TRANSFER_KEY, // 40 API 키값
        "TRT_INST_CD": this.TRT_INST_CD, // 8 취급기관 코드
        "BANK_CD": this.BANK_CD, // test // 3 취급기관코드에 연동된 은행 코드
        "TRSC_SEQ_NO": TRSC_SEQ_NO, // 12 거래일별 고유번호
        "RCV_BNK_CD": bankCode, // 3 입금계좌 은행코드
        "RCV_ACCT_NO": bankAccount, // 16 입금 대상 계좌번호
        "WDRW_ACCT_NO": this.WDRW_ACCT_NO, // 16 출금 계좌번호
        "TRSC_AMT": String(settlementAmount), // 13 입금금액, 이걸로 아래를 바꿔야 함
        "WDRW_ACCT_NM": name // 20 의뢰인명, 미설정 시 기본적으로 등록된 의뢰인명으로 처리
      }
    } else {
      body = {
        "SECR_KEY": this.SECR_KEY, // 20 고객사 인증키 값
        "KEY": BANK_TRANSFER_KEY, // 40 API 키값
        "TRT_INST_CD": this.TRT_INST_CD, // 8 거래일별 고유번호
        "BANK_CD": this.BANK_CD, // test // 3 취급기관코드에 연동된 은행 코드
        "TRSC_SEQ_NO": TRSC_SEQ_NO, // 12 거래일별 고유번호
        "RCV_BNK_CD": bankCode, // 3 입금계좌 은행코드
        "RCV_ACCT_NO": bankAccount, // 16 입금 대상 계좌번호
        "WDRW_ACCT_NO": "0000000000000000", // 16 출금 계좌번호
        "TRSC_AMT": "5000", // 입금금액 테스트!
        "WDRW_ACCT_NM": '리틀뱅크' // 20 의뢰인명, 미설정 시 기본적으로 등록된 의뢰인명으로 처리
      }
    }

    const headers = {
      'content-type': 'application/json'
    }

    const { data } = await axios.post(
      this.URL,
      body,
      {
        headers
      }
    )

    logger.info('transfer res ' + JSON.stringify(data, null, 2))
    
    const { RESP_CD, RESP_MSG } = data
    if (!RESP_CD) {
      throw new Error('은행사와의 통신이 원활하지 않습니다.')
    }
    if (RESP_CD !== '0000') {
      if (RESP_CD[0] === '9' && RESP_CD.length === 4) {
        throw new Error(RESP_MSG)
      } else {
        throw new Error('자동 정산에 실패하였습니다. 운영자에게 문의해 주시기 바랍니다. error code: 2')
      }
    }
    return data
  }

  /**
   * allowance_settlement 테이블의 PK를 받아 TRSC_SEQ_NO를 생성합니다.
   * @param number 
   * @returns 
   */
  private generateTRSCSeqNo(number: number) {
    if (number < 0) {
      throw new Error('숫자는 음수일 수 없습니다.');
    }
    const numberStr = number.toString();
    if (numberStr.length > 12) {
      throw new Error('숫자가 12자리를 초과합니다.');
    }
    return numberStr.padStart(12, '0');
  }
  
  /**
   * 정산을 진행합니다.
   * settlementType은 manual과 auto 두 가지로 나눠어집니다.
   * 
   * 수동 정산(manual)은 신청하게 되면 admin의 정산 페이지에서 목록만 확인할 수 있습니다. (241002 기준으로 페이지 디자인이 아직 나오지 않았습니다.)
   * 해당 목록을 확인하고, 별도의 은행 클라이언트 프로그램으로 클라이언트가 직접 송금하는 방식입니다.
   * @param profileId 
   * @param options 
   * @param connection 
   * @returns 
   */
  async postSettlement(profileId:number, options:{
    settlementType:string,
    settlementAmount:number
  }, connection?: PoolConnection): Promise<void> {
    let {settlementType, settlementAmount} = options    
    const adminSetting = await adminService.getSetting()
    const depositFeeMin = adminSetting.data[0].depositFeeMin ?? 0
    const depositFee = adminSetting.data[0].depositFee ?? 0
    let {isParent, childAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(isParent !== 0) {throw new Error ('아이만 가능합니다.')}
    if(settlementAmount > childAmount) {throw new Error ('잔여 금액이 부족합니다.')}  
    if(settlementAmount < depositFeeMin) {throw new Error (`최소 정산 금액은 ${depositFeeMin}원 입니다.`)}
    let insertId: number

    if (settlementType === 'auto') {
      const settlementFee = Math.ceil(settlementAmount * depositFee / 100)
      insertId = await settlementModel.createSettlement({profileId, settlementType, settlementStatus:'pending', settlementAmount, settlementFee}, connection)
      if(!insertId) {
        throw new Error('정산 신청에 실패하였습니다.')
      }

      const realAmount = settlementAmount - settlementFee
      await this.processAutoSettlement(profileId, realAmount, insertId)
    } else {
      insertId = await settlementModel.createSettlement({profileId, settlementType, settlementStatus:'pending', settlementAmount }, connection)
      if(!insertId) {
        throw new Error('정산 신청에 실패하였습니다.')
      }
    }

    const allowanceType = 'settlement'
    const history = await historyModel.createHistory({profileId, allowanceType, targetId:insertId}, connection)
    if (!history) {throw new Error('포인트 전송 기록에 실패하였습니다.')}

    childAmount -= settlementAmount
    const profile = await profileModel.updateProfileById(profileId, {childAmount}, connection)
    if(!profile) {
      throw new Error('정산 신청에 실패하였습니다.')
    }
    if (settlementType === 'auto') {
      const ret = await settlementModel.updateSettlement(insertId, {settlementStatus :'complete'}, connection)
      if (!ret) {
        throw new Error('입금 처리에 실패하였습니다.')
      }
    }
  }

  async getSettlementHistories(options:{startTime?: string, endTime?: string, order: string, settlementType?:string, settlementStatus?:string, page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await settlementModel.findAllAllSettlements(options)
    
    return ret   
  }

  async getSettlementsMobile(profileId:number, options:{page: number, perPage: number},connection?: PoolConnection): Promise<void> {    
    const ret = await settlementModel.findAllAllSettlementsMobile(profileId, options)
    
    return ret   
  }

  async putSettlementComplete(allowanceSettlementId: number,connection?: PoolConnection): Promise<any> {                
      const ret = await settlementModel.updateSettlement(allowanceSettlementId, {settlementStatus :'complete'})
      if (!ret) {throw new Error('입금 처리에 실패하였습니다.')}
      
      return ret   
  }

  /**
   * 아래는 현재 사용하지 않는 쿠콘 테스트 코드입니다.
   */
  /**
   * 입금이체 처리결과 조회
   * 
   * body에 들어갈 프로퍼티는 다음과 같습니다.
    {
      "SECR_KEY": this.SECR_KEY, // 20 고객사 인증키 값
      "KEY": "6170", // 40 API 키값
      "TRT_INST_CD": "취급기관코드8자리", // 8 이용 신청 시 발급된 취급기관 코드
      "BANK_CD": "039", // 3 취급기관코드에 연동된 은행 코드
      "TRSC_SEQ_NO": "000000000006", // 12 거래일별 고유번호
      "RQRE_TMSG_NO": "000000000005", // 12 입금 이체 요청(6120) 거래 시 입력한 거래일련번호
      "REQ_TRSC_DT": "20191021" // 8 거래 요청일
    }
   */
  private async getBankTransferResult(insertId: number) {
    const BANK_TRANSFER_RESULT_KEY = '6170'
    const TRSC_SEQ_NO = this.generateTRSCSeqNo(insertId)
    const settlement = await settlementModel.findSettlementById(insertId)
    if (!settlement) {
      throw new Error('정산 내역을 찾을 수 없습니다.')
    }
    const REQ_TRSC_DT = settlement.createdAt
    const body = {
        "SECR_KEY": this.SECR_KEY,
        "KEY": BANK_TRANSFER_RESULT_KEY,
        "TRT_INST_CD": this.TRT_INST_CD, // test
        "BANK_CD": this.BANK_CD, // test
        "TRSC_SEQ_NO": TRSC_SEQ_NO,
        "RQRE_TMSG_NO": TRSC_SEQ_NO,
        "REQ_TRSC_DT": "20241004"
    }
    const headers = {
      'content-type': 'application/json'
    }

    const { data } = await axios.post(
      this.URL,
      body,
      {
        headers
      }
    )
    return data
  }

  async getBankTransferBalance(insertId: number) {
    const BANK_TRANSFER_RESULT_KEY = '6140'
    const TRSC_SEQ_NO = this.generateTRSCSeqNo(insertId)
    const body = {
        "SECR_KEY": this.SECR_KEY,
        "KEY": BANK_TRANSFER_RESULT_KEY,
        "TRT_INST_CD": this.TRT_INST_CD,
        "BANK_CD": this.BANK_CD, // test
        "TRSC_SEQ_NO": TRSC_SEQ_NO
    }
    const headers = {
      'content-type': 'application/json'
    }

    const { data } = await axios.post(
      this.URL,
      body,
      {
        headers
      }
    )
    return data
  }
  
  async getSettlementUsersDownload() {
    const ret = await settlementModel.getUsersDownload()
      if(ret.data.length === 0) throw new Error('다운로드할 정보가 없습니다.')    
  
      const today = new Date()
      let fileName = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}_리틀뱅크 수동 송금 대상`    
  
      fileName = encodeURIComponent(fileName)
  
      const columns = ['순번','프로필 이름','은행명','계좌번호','정산종류','정산상태','정산신청금액', '요청날짜']        
     
      const transformedData = ret.data.map(obj => Object.values(obj))
      transformedData.unshift(columns) 
  
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(transformedData)
      XLSX.utils.book_append_sheet(workbook, worksheet, '리틀뱅크 수동 송금 대상')
  
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })    
  
      return {excelBuffer, fileName}
  }
}

export const settlementService = new SettlementService()
