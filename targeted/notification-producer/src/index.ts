import { kafka } from './kafkaSetup.js';
import { createNotification, USERS_COUNT } from './notificationGenerator.js';
import { getRandomInt } from './utils.js';
import { printTopicsList } from './kafkaHelper.js';

const routerReplicasCount = 3;

const cadencyPerUserInSeconds = 60;
const intervalInSeconds = cadencyPerUserInSeconds / USERS_COUNT;

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
}, intervalInSeconds * 1000);

//await producer.disconnect();
