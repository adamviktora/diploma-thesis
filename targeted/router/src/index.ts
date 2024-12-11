import { KafkaMessage } from 'kafkajs';
import {
  kafka,
  NOTIFICATION_TARGETED_TOPIC_NAME,
  NOTIFICATION_TOPIC_NAME,
} from './kafkaSetup.js';
import { redisReplicas } from './redisSetup.js';

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: NOTIFICATION_TOPIC_NAME });

const producer = kafka.producer();
await producer.connect();

const publishMessageOnPartition = async (
  message: KafkaMessage,
  partition: number
) => {
  await producer.send({
    topic: NOTIFICATION_TARGETED_TOPIC_NAME,
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
      console.log(`✗ User ${userId} is not connected on any WS server`);
    }
  },
});
