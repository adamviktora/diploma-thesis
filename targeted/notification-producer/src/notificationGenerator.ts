import { USERS_COUNT } from './constants.js';
import { pickRandom } from './utils.js';

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
export { USERS_COUNT };
