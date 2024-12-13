import { ProducerRecord } from 'kafkajs';
import { NOTIFICATION_TOPIC_NAME, USERS_COUNT } from './constants.js';
import { pickRandom } from './utils.js';

const userIdList = [...Array(USERS_COUNT).keys()].map((i) => `user${i}`);

// from https://github.com/RedHatInsights/chrome-service-backend/blob/main/cmd/kafka/testMessage.go
const createExampleNotification = () => ({
  specversion: '1.0.2',
  type: 'com.redhat.console.notifications.drawer',
  source: 'https://whatever.service.com',
  id: 'test-message',
  time: '2023-05-23T11:54:03.879689005+02:00',
  datacontenttype: 'application/json',
  data: {
    broadcast: false,
    usernames: [pickRandom(userIdList)],
    payload: {
      id: 'unique-id',
      description: 'This is a random description',
      title: 'Some notification title',
      created: '2023-05-23T11:54:03.879689005+02:00',
      read: false,
      source: 'string',
    },
  },
});

const createNotificationValue = () => {
  const notification = createExampleNotification();

  console.log('Creating notification for:', notification.data.usernames);

  return notification;
};

export const createNotificationEvent: () => ProducerRecord = () => ({
  topic: NOTIFICATION_TOPIC_NAME,
  messages: [
    {
      value: JSON.stringify(createNotificationValue()),
    },
  ],
});
