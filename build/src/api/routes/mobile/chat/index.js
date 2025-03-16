"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessages = exports.getFamilies = exports.getDirectChatRoom = void 0;
const default_1 = require("../../default");
const chatCtrl_1 = require("./chatCtrl");
const getDirectChatRoom = new default_1.ApiRouter({
    name: 'room/:id',
    method: 'get',
    summary: 'Direct(1:1) 채팅방 입장',
    description: `
    v1.0.0
    2024-07-29 12:30
    작성자 : 윤재상
    메시지 목록을 조회하며 웹 소켓 채팅방과 연결합니다.
    ---------------------------------------
    id -> private(1:1) 채팅을 진행할 친구의 profileId

    chatType에 따라 content를 다르게 설정합니다.
      1. message, photo
        content = {
          chatContent: string
        }
        
      2. mission
        content = {
          allowanceMissionId:number,
          missionChat: string,
          missionAmount: number,
          missionStartDate: string,
          missionStatus: string,
          missionEndDate: string,
          missionParentComment: string,
          missionParentImage: string,
          missionChildComment?: string,
          missionChildImage?: string,
          childProfileId?: number,
          childProfileName?: string 
        }
  
      3. album
        content = {
          allowanceAlbumId: number,
          albumChat: string,
          albumAmount: number,      
          albumStatus: string,
          albumImages: [string]
        }
  
      4. task
        content = {
          allowanceChatId: number,
          allowanceChat: string,
          allowanceAmount: number,
          allowanceChatStatus: string,
          allowanceChatImage: string,      
          allowanceContent: string
        }
    자세한 사항은 아래 Notion 참고 바랍니다.
    https://www.notion.so/69c4091a205a4361831f58e983e4ce59?pvs=4
  `,
    tags: ['Chat'],
    paths: ['common/idPath'],
    schema: 'requests/mobile/chat/chatPage',
    isPublic: false,
    responses: {
        200: { schema: 'responses/mobile/chat/getChatRoom' }
    },
    handler: chatCtrl_1.chatCtrl.getDirectChatRoom
});
exports.getDirectChatRoom = getDirectChatRoom;
const getFamilies = new default_1.ApiRouter({
    name: 'family',
    method: 'get',
    summary: '가족 채팅방 입장',
    description: `
    v1.0.0
    2024-07-29 17:24
    작성자 : 윤재상
    가족 목록과 가족 채팅방 메시지 목록을 조회하며 웹 소켓 채팅방과 연결합니다.
    ---------------------------------------
    chatType에 따라 content를 다르게 설정합니다.
      1. message, photo
        content = {
          chatContent: string
        }
        
      2. mission
        content = {
          allowanceMissionId:number,
          missionChat: string,
          missionAmount: number,
          missionStartDate: string,
          missionStatus: string,
          missionEndDate: string,
          missionParentComment: string,
          missionParentImage: string,
          missionChildComment?: string,
          missionChildImage?: string,
          childProfileId?: number,
          childProfileName?: string 
        }
  
      3. album
        content = {
          allowanceAlbumId: number,
          albumChat: string,
          albumAmount: number,      
          albumStatus: string,
          albumImages: [string]
        }
  
      4. task
        content = {
          allowanceChatId: number,
          allowanceChat: string,
          allowanceAmount: number,
          allowanceChatStatus: string,
          allowanceChatImage: string,      
          allowanceContent: string
        }
    자세한 사항은 아래 Notion 참고 바랍니다.
    https://www.notion.so/69c4091a205a4361831f58e983e4ce59?pvs=4
  `,
    tags: ['Chat'],
    isPublic: false,
    schema: 'requests/mobile/chat/chatPage',
    responses: {
        200: { schema: 'responses/mobile/chat/getFamilies' }
    },
    handler: chatCtrl_1.chatCtrl.getFamilies
});
exports.getFamilies = getFamilies;
const getChatMessages = new default_1.ApiRouter({
    name: 'room/:id/message',
    method: 'get',
    summary: '채팅방 메시지 목록 조회',
    description: `
    v1.0.0
    2024-08-06 10:30
    작성자 : 윤재상
    ---------------------------------------
    - id -> chatRoomId
    - page 1은 조회 시 가져왔으므로 스크롤 이벤트로 메시지 목록을 조회 할 때는 2부터 시작하면 됩니다.

    chatType에 따라 content를 다르게 설정합니다.
      1. message, photo
        content = {
          chatContent: string
        }
        
      2. mission
        content = {
          allowanceMissionId:number,
          missionChat: string,
          missionAmount: number,
          missionStartDate: string,
          missionStatus: string,
          missionEndDate: string,
          missionParentComment: string,
          missionParentImage: string,
          missionChildComment?: string,
          missionChildImage?: string,
          childProfileId?: number,
          childProfileName?: string 
        }
  
      3. album
        content = {
          allowanceAlbumId: number,
          albumChat: string,
          albumAmount: number,      
          albumStatus: string,
          albumImages: [string]
        }
  
      4. task
        content = {
          allowanceChatId: number,
          allowanceChat: string,
          allowanceAmount: number,
          allowanceChatStatus: string,
          allowanceChatImage: string,      
          allowanceContent: string
        }
    자세한 사항은 아래 Notion 참고 바랍니다.
    https://www.notion.so/69c4091a205a4361831f58e983e4ce59?pvs=4
  `,
    tags: ['Chat'],
    paths: ['common/idPath'],
    schema: 'requests/mobile/chat/chatPage',
    isPublic: false,
    responses: {
        200: { schema: 'responses/mobile/chat/getChatMessages' }
    },
    handler: chatCtrl_1.chatCtrl.getChatMessages
});
exports.getChatMessages = getChatMessages;
