import { sleep } from 'k6';
import { WebSocket } from 'k6/experimental/websockets';

const port = '65288';
const USERS_COUNT = 10_000;
const minutes = 9.9;

export let options = {
  stages: [
    { duration: '2m', target: USERS_COUNT }, // Ramp-up to 300 virtual users
    { duration: '6m', target: USERS_COUNT }, // Hold at 1000 virtual users
    { duration: '2m', target: 0 }, // Ramp-down to 0 virtual users
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
    console.log(data);
  });

  return ws;

  // Set a timeout to automatically close the WebSocket after a period
  // setTimeout(() => {
  //   console.log('3000 milisecons passed');
  //   console.log(ws.readyState);

  //   if (ws.readyState === 1) {
  //     ws.close();
  //     console.log(
  //       `WebSocket connection timed out and closed for userId: ${userId}`
  //     );
  //   }
  // }, getMiliSeconds(minutes));
};

export default function () {
  const userId = `user${__VU - 1}`; // Adjust __VU to start from 0
  const ws1 = startWebSocket(userId);
}
