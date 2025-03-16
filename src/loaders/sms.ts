import popbill from 'popbill'
import config from 'config'
import {aws, logger} from './'

const awsSecrets: {[p: string]: any} = config.get('aws.secrets')
// const IsTest = true
const IsTest = false
// const IsTest = process.env.NODE_ENV !== 'production'

let messageService, popbillConfig, kakaoService
const serviceName = '구슬땀'

async function init() {
  popbillConfig = await aws.getSecretValue(awsSecrets.popbill)
  popbill.config({
    LinkID: popbillConfig.linkId,
    SecretKey: popbillConfig.secretKey,
    IsTest,
    defaultErrorHandler: (err) => {
      logger.error(`err : [${err.code}] ${err.message}`)
    }
  })
  messageService = popbill.MessageService()
  kakaoService = popbill.KakaoService()
  logger.debug('Popbill loaded')
}

function sendSMS(phone, contents) {
  return new Promise((resolve, reject) => {
    try {      
      const senderPhone = popbillConfig.senderPhone      
      // const senderPhone = IsTest ? popbillConfig.testSenderPhone : popbillConfig.senderPhone      

      messageService.sendSMS(
        popbillConfig.corporateNumber, // 사업자 등록 번호
        senderPhone, // 발신자 번호        
        phone, // 수신자 번호
        '', // 수신자명
        `[${serviceName}] ${contents}`, // 메시지 내용
        '', // 예약 문자 시간 (누락 시 즉시 전송)
        false, // 광고 문자 여부
        (result) => {
          logger.info(`[SMS] sendUser result : ${result}`)
          resolve(result)
        },
        (err) => {
          logger.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)
          reject(err)
        }
      )
    } catch (err) {
      logger.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)      
      resolve(err)
    }
  })
}

function sendKakao(phone, contents) {
  return new Promise((resolve, reject) => {
    try {      
      const senderPhone = popbillConfig.senderPhone      
      // const senderPhone = IsTest ? popbillConfig.testSenderPhone : popbillConfig.senderPhone
      kakaoService.sendATS_one(
        popbillConfig.corporateNumber, //사업자 등록 번호
        '템플릿코드 넣을 예정', // 템플릿 코드
        senderPhone, // 발신자 번호
        `[${serviceName}] ${contents}`, // 내용
        '', // 대체문자 제목
        '', // 대체문자 내용
        '', // 대체문자 유형
        '', // 예약
        phone, // 수신자 번호
        '', // 팝빌회원 아이디
        '', // 요청번호
        '', // 버튼 링크
        (result) => {
          logger.info(`[kakao] sendUser result : ${result}`)
          resolve(result)
        },
        (err) => {
          logger.error(`[kakao] sendUser err : ${JSON.stringify(err)}`)
          reject(err)
        }
      )   
    } catch (err) {
      logger.error(`[kakao] sendUser err : ${JSON.stringify(err)}`)      
      resolve(err)
    }
  })
}

async function sendUserId(phone, email) {
  const message = `이메일은 ${email} 입니다.`
  
  await sendSMS(phone, message)
}

async function sendVerificationCode(phone, code) {
  try {
    const message = `인증번호는 ${code} 입니다.`

    await sendSMS(phone, message)
  } catch (e) {
    throw e
  }
}

async function sendResetPassword(phone, password) {
  const message = `임시비밀 번호는 ${password}입니다.`

  await sendSMS(phone, message)
}

export {
  init,
  sendUserId,
  sendVerificationCode,
  sendResetPassword,
  sendKakao
}
