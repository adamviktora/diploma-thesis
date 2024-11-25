import { pickRandom } from './utils.js';

export const USERS_COUNT = 1000;

const userIdList = [...Array(USERS_COUNT).keys()].map((i) => `user${i}`);
const messages = [
  'Hello!',
  'Some notification',
  'Good morning!',
  'Hey hey hey',
];

export const createNotification = () => {
  const userId = pickRandom(userIdList);
  const message = pickRandom(messages);

  return { userId, message };
};
