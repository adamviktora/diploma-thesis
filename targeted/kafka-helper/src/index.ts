import { routerReplicasCount, wsServerReplicasCount } from './constants.js';
import { createTopic, printTopicInfo } from './kafkaHelper.js';
import { kafka } from './kafkaSetup.js';

const admin = kafka.admin();
await admin.connect();

// await admin.deleteTopics({
//   topics: ['notification', 'notification-partitioned'],
// });

await createTopic(admin, 'notification', routerReplicasCount);
await createTopic(admin, 'notification-partitioned', wsServerReplicasCount);

setInterval(async () => {
  console.log(await admin.listTopics());
}, 15_000);

// console.log(await admin.listTopics());
// await printTopicInfo(admin, 'notification');
// await printTopicInfo(admin, 'notification-partitioned');

await admin.disconnect();
