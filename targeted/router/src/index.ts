import { kafka } from './kafkaSetup.js';
import { getRedisKeys, redisReplicas } from './redisSetup.js';

const keys = (await getRedisKeys()).filter((key) =>
  key.startsWith('userPods:')
);
console.log('Redis:');
for (const key of keys) {
  console.log(key);
  console.log(await redisReplicas.smembers(key));
}

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: 'notification', fromBeginning: true });

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});
await producer.connect();

const data = await consumer.describeGroup();
console.log('COSNUMER-GROUP');
console.log(data);

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log(`topic: ${topic}, partition: ${partition}`);

    if (!message.value) {
      return;
    }

    const { userId } = JSON.parse(message.value.toString());

    const podList = await redisReplicas.smembers(`userPods:${userId}`);

    if (podList.length) {
      podList.forEach(async (pod) => {
        console.log(`sending notification for user: ${userId} to pod: ${pod}`);

        await producer.send({
          topic: `notification-${pod}`,
          messages: [message],
        });
      });
    } else {
      // TODO: how to handle such cases? We can't just ignore the message
      // --> send it to some general topic which will be picked up after user connects / store it in Redis?
      console.log(`User ${userId} is not yet connected on a WS server`);
    }
  },
});
