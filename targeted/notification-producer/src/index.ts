import { CADENCY_PER_USER_IN_SECONDS, USERS_COUNT } from './constants.js';
import { kafka } from './kafkaSetup.js';
import { createNotificationEvent } from './notificationGenerator.js';

const intervalInSeconds = CADENCY_PER_USER_IN_SECONDS / USERS_COUNT;

const producer = kafka.producer();
await producer.connect();

const sendNotification = async () => {
  await producer.send(createNotificationEvent());
};

setTimeout(() => {
  setInterval(sendNotification, intervalInSeconds * 1000);
}, 15_000);
