import { kafka } from './kafkaSetup.js';
import { createNotification } from './notificationGenerator.js';
import { getRandomInt } from './utils.js';
import { printTopicsList } from './kafkaHelper.js';

const routerReplicasCount = 3;
const senderCadencyInSeconds = 0.5;

await printTopicsList(kafka);

const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

await producer.connect();

setInterval(async () => {
  await producer.send({
    topic: 'notification',

    messages: [
      {
        value: JSON.stringify(createNotification()),
        partition: getRandomInt(routerReplicasCount),
      },
    ],
  });
}, senderCadencyInSeconds * 1000);

//await producer.disconnect();
