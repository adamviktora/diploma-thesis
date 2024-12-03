const WebSocket = require('ws');

const getRandomInt = (max) => Math.floor(Math.random() * max);
const pickRandom = (array) => array[getRandomInt(array.length)];

const ports = ['8000', '8001', '8002'];
const USERS_COUNT = 3000;

const startWebSocket = (userId) => {
  const port = pickRandom(ports);
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

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = async () => {
  for (let userNumber = 0; userNumber < USERS_COUNT; userNumber++) {
    startWebSocket(`user${userNumber}`);
    await sleep(50);
  }
};

main();
