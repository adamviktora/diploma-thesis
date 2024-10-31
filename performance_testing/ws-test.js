import { WebSocket } from 'k6/experimental/websockets';

// export let options = {
//   stages: [
//     { duration: '1m', target: 5 }, // Ramp-up to 500 connections
//     { duration: '3m', target: 10 }, // Hold at 1000 connections
//     { duration: '1m', target: 0 }, // Ramp-down to 0
//   ],
// };

const port = '56919';

const minutes = 10;

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

  // Set a timeout to automatically close the WebSocket after a period
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
      console.log(
        `WebSocket connection timed out and closed for userId: ${userId}`
      );
    }
  }, getMiliSeconds(minutes)); // closes connection after 10 seconds
};

export default function () {
  for (let i = 0; i < 10; i++) {
    startWebSocket(`user${i}`);
  }
}
