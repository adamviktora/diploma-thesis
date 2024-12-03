import { kafka } from './kafkaSetup.js';
import { redisReplicas } from './redisSetup.js';

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: 'notification', fromBeginning: true });

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});
await producer.connect();

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    if (!message.value) {
      return;
    }

    const { userId } = JSON.parse(message.value.toString());

    const podNumbers = await redisReplicas.smembers(`userPodNums:${userId}`);

    if (podNumbers.length) {
      podNumbers.forEach(async (podNum) => {
        console.log(
          `✓ Publishing a notification for ${userId} on partition ${podNum}`
        );

        await producer.send({
          topic: `notification-partitioned`,
          messages: [
            {
              value: message.value,
              partition: Number(podNum),
            },
          ],
        });
      });
    } else {
      // in this POC implementation, we can just ignore the message
      console.log(`✗ User ${userId} is not yet connected on a WS server`);
    }
  },
});
