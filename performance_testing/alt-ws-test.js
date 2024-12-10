const WebSocket = require('ws');

const USERS_COUNT = 5000;

const ip = '192.168.105.5';
const port = 30300;

const startWebSocket = (userId) => {
  const ws = new WebSocket(`ws://${ip}:${port}`);

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

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = async () => {
  for (let userNumber = 0; userNumber < USERS_COUNT; userNumber++) {
    startWebSocket(`user${userNumber}`);
    await sleep(20);
  }
};

main();
