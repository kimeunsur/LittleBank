const io = require('socket.io-client')
const readline = require('readline')
const {ChatType} = require('./chatType')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function connectToChatRoom() {
  rl.question('Enter Bearer token: ', (tokenInput) => {
    const token = `Bearer ${tokenInput.trim()}`

    rl.question('Enter chatRoomId: ', (chatRoomId) => {
      // const socket = io('http://localhost:4000', {
      const socket = io('https://prod-be.siwonpp.co.kr:4000' , {
      // const socket = io('https://dev-be.siwonpp.co.kr:4000' , {
      // const socket = io('http://54.180.151.152:4000' , { // dev
      // const socket = io('http://43.203.200.48:4000' , { // prod
        auth: {
          token: token
        },
        transports: ['websocket'],  // WebSocket 프로토콜을 사용하도록 설정
        secure: true,               // HTTPS 사용시 secure 옵션 설정
        reconnection: true,          // 재접속 설정
        // rejectUnauthorized: false,   // self-signed 인증서를 사용할 경우 필요
      })

      const handleConnection = () => {
        console.log('Connected to server')
        rl.setPrompt('Enter message: ')
        rl.prompt()

        // 'line' 이벤트 핸들러 등록
        rl.removeAllListeners('line')
        rl.on('line', (input) => {
          socket.emit(
            'sendMessage',
            {
              chatRoomId: Number(chatRoomId),
              chatType: ChatType.MESSAGE,
              content: {
                chatContent: input.trim()
              }
            },
            (response) => {
              if (response) {
                console.log('Response:', response)
              }
              rl.prompt()
            }
          )
        })
      }

      socket.on('connect', handleConnection)

      socket.on('receiveMessage', (data) => {
        console.log('\nReceived message: ' + JSON.stringify(data, null, 2) + '\n')
        rl.prompt()
      })

      socket.on('receiveUnreadUserCount', (data) => {
        console.log('\nReceive unreadUserCount: ' + JSON.stringify(data, null, 2) + '\n')
        rl.prompt()
      })

      socket.on('receiveUnreadMessageCount', (data) => {
        console.log('\nReceive unreadMessageCount: ' + JSON.stringify(data, null, 2) + '\n')
        rl.prompt()
      })

      socket.on('changeChatStatus', (data) => {
        console.log('\nReceived mission status: ' + JSON.stringify(data, null, 2) + '\n')
        rl.prompt()
      })

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason)
        socket.removeListener('connect', handleConnection) // 기존의 connect 이벤트 핸들러 제거
        connectToChatRoom() // 재연결 시도
      })
    })
  })
}

connectToChatRoom()
