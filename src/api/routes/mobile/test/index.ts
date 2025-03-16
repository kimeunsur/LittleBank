import {ApiRouter} from '../../default'
import {testCtrl} from './testCtrl'

const testt = new ApiRouter({
  name: 'test',
  method: 'get',
  summary: 'test api',  
  description: `
    hi hi i'm so hi
  `,
  tags: ['Test'],
  isPublic: true,  
  responses: {
    200: {description: 'success'}    
  },
  handler: testCtrl.testt
})

export {
  testt
}