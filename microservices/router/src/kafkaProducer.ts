import { KafkaMessage } from 'kafkajs';
import {
  NOTIFICATION_GENERAL_TOPIC_NAME,
  NOTIFICATION_TARGETED_TOPIC_NAME,
} from './constants.js';
import { kafka } from './kafkaSetup.js';
import { pickPartition } from './partitions.js';

const producer = kafka.producer({
  allowAutoTopicCreation: false,
});
await producer.connect();

export const publishMessageOnPartition = async (
  message: KafkaMessage,
  podNum: number
) => {
  const partition = pickPartition(podNum);
  console.log(
    `✓ Publishing a notification on partition ${partition} to be consumed by pod ${podNum}`
  );

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

export const publishMessageOnGeneralTopic = async (message: KafkaMessage) => {
  await producer.send({
    topic: NOTIFICATION_GENERAL_TOPIC_NAME,
    messages: [{ value: message.value }],
  });
};
