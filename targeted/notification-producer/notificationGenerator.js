import { pickRandom } from './utils.js';

const userIdList = ['userA', 'userB', 'userC', 'userD'];
const messages = [
  'Hello!',
  'Random notification message',
  'Some alert text',
  'Please pay for your subscription',
];

export const createNotification = () => {
  const userId = pickRandom(userIdList);
  const message = pickRandom(messages);

  return { userId, message };
};
