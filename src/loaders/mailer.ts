import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import config from 'config'
import {aws, logger} from './index'

const awsSecrets: Dictionary = config.get('aws.secrets')
let transporter = null
let senderEmail = null

async function init(): Promise<void> {
  const {service, sender, accountId, pass} = await aws.getSecretValue(awsSecrets.mailer)
  senderEmail = [sender]
  transporter = nodemailer.createTransport({
    service,
    auth: {
      user: accountId,
      pass
    }
  })
  logger.debug('Mailer loaded')
}

async function sendToUsers(to, subject, html): Promise<void> {
  try {
    if (['development', 'production'].indexOf(process.env.NODE_ENV) !== -1) return
    if (process.env.NODE_ENV !== 'production') subject = `[DEV]${subject}`

    const mailOptions = {
      from: senderEmail,
      to,
      subject,
      html
    }
    await transporter.sendMail(mailOptions)
  } catch (e) {
    throw e
  }
}

async function sendResetPassword(to: string, confirmToken: string): Promise<void> {
  try {
    const subject = '패스워드 변경'
    const html = await ejs.renderFile(
      path.join(__dirname, '../views/resetPasswordEmailSend.ejs'),
      {confirmToken},
      {async: true}
    )
    await sendToUsers(to, subject, html)
  } catch (e) {
    throw e
  }
}

async function sendTempPassword(to: string, name: string, password: string): Promise<void> {
  try {
    const subject = '임시 패스워드 발급'
    const html = await ejs.renderFile(
      path.join(__dirname, '../views/resetPasswordResult.ejs'),
      {name, password},
      {async: true}
    )
    await sendToUsers(to, subject, html)
  } catch (e) {
    throw e
  }
}

export {sendResetPassword, sendTempPassword, sendToUsers, init}
