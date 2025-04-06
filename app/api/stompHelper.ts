import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { getApiDomain } from '@/utils/domain';

const socket = new SockJS(getApiDomain() + '/lobby');

export const stompClient = new Client({
  webSocketFactory: () => socket,
  connectHeaders: {
    Authorization: "2ddbe931-c35f-4bb1-869d-83b519e0f31d" // 🔑 set your token here
  },
  onConnect: (frame) => {
    console.log('Connected: ', frame);
    // Now you can subscribe/send
  },
  onStompError: (frame) => {
    console.error('STOMP error:', frame);
  },
  debug: (str) => {
    console.log('[STOMP]', str);
  }
});
