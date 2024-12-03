import {
  CADENCY_PER_USER_IN_SECONDS,
  routerReplicasCount,
  USERS_COUNT,
  wsServerReplicasCount,
} from './constants.js';
import { createTopic, printTopicInfo } from './kafkaHelper.js';
import { kafka } from './kafkaSetup.js';
import { createNotification } from './notificationGenerator.js';
import { getRandomInt } from './utils.js';

const intervalInSeconds = CADENCY_PER_USER_IN_SECONDS / USERS_COUNT;

const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

await producer.connect();

const admin = kafka.admin();
await admin.connect();

//await admin.deleteTopics({ topics: ['notification-partitioned'] });

await createTopic(admin, 'notification', routerReplicasCount);
await createTopic(admin, 'notification-partitioned', wsServerReplicasCount);

console.log(await admin.listTopics());
await printTopicInfo(admin, 'notification');
await printTopicInfo(admin, 'notification-partitioned');

await admin.disconnect();

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
