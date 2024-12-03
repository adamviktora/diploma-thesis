import { WebSocket } from 'k6/experimental/websockets';

const port = '3000';
const USERS_COUNT = 3000;

export let options = {
  stages: [
    { duration: '4m', target: USERS_COUNT },
    { duration: '12m', target: USERS_COUNT },
    { duration: '4m', target: 0 },
  ],
};

const getMiliSeconds = (minutes) => minutes * 60 * 1000;

const startWebSocket = (userId) => {
  const ws = new WebSocket(`ws://localhost:${port}`);

  console.log(`userId: ${userId}`);

  const userConnectionMessage = JSON.stringify({
    type: 'USER_CONNECTION',
    userId,
  });

  ws.onopen = () => {
    ws.send(userConnectionMessage);
  };

  ws.addEventListener('message', ({ data }) => {
    //console.log(data);
  });

  return ws;
};

export default function () {
  const userId = `user${__VU - 1}`; // Adjust __VU to start from 0
  startWebSocket(userId);
}
