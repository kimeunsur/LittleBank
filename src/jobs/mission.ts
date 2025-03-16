import Agenda from 'agenda'
import config from 'config'

const mongoDbConfig: Dictionary = config.get('mongodb')
const mongoConnectionString = mongoDbConfig.agenda
const agenda = new Agenda({db: {address: mongoConnectionString, options: {useUnifiedTopology: true}}})

// agenda.on('ready', () => console.log('Agenda loaded'))
// agenda.on('error', (error) => console.error('Agenda error:', error))

async function cancelAllJobs() {  
  await agenda.cancel({});
}

(async function () {  
  await agenda.start().then(async () => {
    await cancelAllJobs()
  })
  
})()

export {agenda}
