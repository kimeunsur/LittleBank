import config from 'config'
import axios from 'axios'
import {aws, logger} from '../loaders'

class IamportManager {
    private iamportUrl = 'https://api.iamport.kr'    
    private awsSecrets: Dictionary = config.get('aws.secrets')      

    private async getToken(): Promise<any> {
    try {
        const {impKey, impSecret} = await aws.getSecretValue(this.awsSecrets.iamport)
        const {
        data: {response}
        } = await axios.post(
        this.iamportUrl + `/users/getToken`,
        {
            imp_key: impKey,
            imp_secret: impSecret
        },
        {
            headers: {
                'content-type': 'application/json'
            }
            }
        )
        return response.access_token
    } catch (e) {
        logger.error(e)
        throw e
    }
    }

     // 다날 본인인증 조회
     async getCertifications(options:{
        imp_uid: string
      }): Promise<any> {
        try {             
            const accessToken = await this.getToken()
            
            const url = this.iamportUrl + `/certifications/${options.imp_uid}`            
            const data = await axios.get(
            url,            
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
                }
            )          
            // if(data.code!==0) throw new Error(data.message)    
            return data.data.response.phone
        } catch (e) {            
            console.log(e.response.data)
            throw e
        }
    }

      // 다날 본인인증 요청
      async postCertifications(options:{
        name: string,
        phone: string,
        birth: string,
        gender_digit: string,
        carrier: string,
        is_mvno: boolean,
        company?: string,       
        pg?: string
      }): Promise<any> {
        try {             
            const accessToken = await this.getToken()
            
            const url = this.iamportUrl + `/certifications/otp/request`            
            const data = await axios.post(
            url,
            options,
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
                }
            )          
            // if(data.code!==0) throw new Error(data.message)    
            return data.data.response.imp_uid
        } catch (e) {            
            console.log(e.response.data)
            throw e
        }
    }

    //  다날 본인인증 확인
    async postCertificationConfrim(options:{
        imp_uid: string,
        otp: string
      }): Promise<any> {
        try {          
            const accessToken = await this.getToken()
            const { data } = await axios.post(
            this.iamportUrl + `/certifications/otp/confirm/${options.imp_uid}`,
            {otp : options.otp},
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
                }
            )
            if(data.code!==0) throw new Error(data.message)    
            return data.response.imp_uid
        } catch (e) {
            logger.error(e)
            throw e
        }
    }
}

export const iamportManager = new IamportManager()