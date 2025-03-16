import crypto from 'crypto'

interface IPasswordHash {
  password: string
  salt: string
}

const passwordIterations = {
  mobile: 123223,
  admin: 123853,
  card: 127242
}

function generateRandomCode(digit: number): number {
  const max = 10 ** digit
  const min = 10 ** (digit - 1)
  return Math.floor(Math.random() * (max - min) + min)
}

function generateRandomPassword(digit: number): string {
  return Math.random().toString(36).slice(-digit)
}

function generateRandomHash(length: number): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^A-Za-z0-9]/g, '')
}

const createPasswordHash = (password: string, iterations: number): IPasswordHash => {
  try {
    const salt = generateRandomHash(64)
    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    return {password: key.toString('base64'), salt}
  } catch (e) {
    throw e
  }
}

const getPasswordHash = (password: string, salt: string, iterations: number) => {
  try {

    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    return key.toString('base64')
  } catch (e) {
    throw e
  }
}

function verifyPassword(password: string, hash: string, salt: string, iterations: number): boolean {
  try {
    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    return key.toString('base64') === hash
  } catch (e) {
    return false
  }
}

const hashSHA256 = (data: string): string => {
  try {
    let hashData = ''
    if(data && data.length > 0) {
      //const hashData = crypto.createHash('sha256').update(data).digest('hex')
      hashData = crypto.pbkdf2Sync(data, 'n0f3', 100, 64, 'sha256').toString('base64')
    }
    
    return hashData
  } catch (e) {
    throw e
  }
}

function convertToDate(input) {
  const rawDate = input.split('-')[0]

  const yearSuffix = rawDate.substring(0, 2)
  const month = rawDate.substring(2, 4)
  const day = rawDate.substring(4, 6)

  const currentYear = new Date().getFullYear()
  const currentYearSuffix = currentYear % 100
  const centuryBase = (parseInt(yearSuffix) <= currentYearSuffix) ? 2000 : 1900
  
  const year = centuryBase + parseInt(yearSuffix)
  
  return `${year}-${month}-${day}`
}

export {
  passwordIterations,
  getPasswordHash,
  generateRandomCode,
  generateRandomPassword,
  generateRandomHash,
  createPasswordHash,
  verifyPassword,
  hashSHA256,
  convertToDate
}
