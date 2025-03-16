import admin from 'firebase-admin'
import config from 'config'
import {logger} from './'
import {getSecretValue} from './aws'

async function init() { 
  try {
    const awsSecrets: Dictionary = config.get('aws.secrets')
    const serviceAccount = await getSecretValue(awsSecrets.firebase)
    
    admin.initializeApp({credential: admin.credential.cert(serviceAccount)})
    logger.debug('Firebase loaded')

  } catch (e) {    
    throw e
  }
}

export {init}
