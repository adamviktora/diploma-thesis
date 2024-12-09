import { KafkaMessage } from 'kafkajs';
import { kafka } from './kafkaSetup.js';
import { redisReplicas } from './redisSetup.js';

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: 'notification' });

const producer = kafka.producer();
await producer.connect();

const publishMessageOnPartition = async (
  message: KafkaMessage,
  partition: number
) => {
  await producer.send({
    topic: `notification-partitioned`,
    messages: [
      {
        value: message.value,
        partition: partition,
      },
    ],
  });
};

await consumer.run({
  eachMessage: async ({ message }) => {
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
        publishMessageOnPartition(message, Number(podNum));
      });
    } else {
      // in this POC implementation, we can just ignore the message
      console.log(`✗ User ${userId} is not yet connected on a WS server`);
    }
  },
});
