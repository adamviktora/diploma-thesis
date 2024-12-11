import { ProducerRecord } from 'kafkajs';
import { NOTIFICATION_TOPIC_NAME, USERS_COUNT } from './constants.js';
import { pickRandom } from './utils.js';

const userIdList = [...Array(USERS_COUNT).keys()].map((i) => `user${i}`);
const messages = [
  'Hello!',
  'Some notification',
  'Good morning!',
  'Hey hey hey',
];

const createNotificationValue = () => {
  const userId = pickRandom(userIdList);
  const message = pickRandom(messages);

  return { userId, message };
};

export const createNotificationEvent: () => ProducerRecord = () => ({
  topic: NOTIFICATION_TOPIC_NAME,
  messages: [
    {
      value: JSON.stringify(createNotificationValue()),
    },
  ],
});
