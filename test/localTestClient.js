const io = require('socket.io-client')
const readline = require('readline')
const { ChatType } = require('./chatType')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let chatRoomId = null // chatRoomId를 전역 변수로 관리

function handleMessageInput(socket) {
  rl.prompt()
  rl.on('line', (input) => {
    const trimmedInput = input.trim()

    if (trimmedInput.toLowerCase() === 'leave') {
      socket.emit('leaveChatRoom', { chatRoomId }, (response) => {
        if (response) {
          console.log('Leave response:', response)
        }
      })
      console.log(`You have left chat room: ${chatRoomId}`)
      rl.removeAllListeners('line') // 기존 line 이벤트 리스너 제거
      connectToChatRoom(socket) // 새로운 chatRoomId를 입력받음
    } else {
      socket.emit(
        'sendMessage',
        {
          chatRoomId,
          chatType: ChatType.MESSAGE,
          content: {
            chatContent: trimmedInput
          }
        },
        (response) => {
          if (response) {
            console.log('Response:', response)
          }
          rl.prompt()
        }
      )
    }
  })
}

function connectToChatRoom(socket) {
  rl.question('Enter chatRoomId: ', (inputChatRoomId) => {
    chatRoomId = Number(inputChatRoomId.trim()) // 입력받은 chatRoomId를 전역 변수에 저장
    console.log(`You have joined chat room: ${chatRoomId}`)
    handleMessageInput(socket) // 메시지 입력 처리
  })
}

rl.question('Enter Bearer token: ', (tokenInput) => {
  const token = `Bearer ${tokenInput.trim()}`
  const socket = io('http://localhost:4000', {
    auth: {
      token: token
    }
  })

  socket.on('connect', () => {
    console.log('Connected to server')
    connectToChatRoom(socket) // 처음 연결 시 chatRoomId 입력받기
  })

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
    // 연결이 끊어지면 재연결 시도
    socket.connect()
  })
})
