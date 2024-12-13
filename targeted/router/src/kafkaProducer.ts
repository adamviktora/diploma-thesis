import { KafkaMessage } from 'kafkajs';
import {
  NOTIFICATION_GENERAL_TOPIC_NAME,
  NOTIFICATION_TARGETED_TOPIC_NAME,
} from './constants.js';
import { kafka } from './kafkaSetup.js';
import { pickPartition } from './utils.js';

const producer = kafka.producer({
  allowAutoTopicCreation: false,
});
await producer.connect();

export const publishMessageOnPartition = async (
  message: KafkaMessage,
  podNum: number
) => {
  await producer.send({
    topic: NOTIFICATION_TARGETED_TOPIC_NAME,
    messages: [
      {
        value: message.value,
        partition: pickPartition(podNum),
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
