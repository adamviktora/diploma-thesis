export const CADENCY_PER_USER_IN_SECONDS = Number(
  process.env.CADENCY_PER_USER_IN_SECONDS ?? 300
);
export const USERS_COUNT = Number(process.env.USERS_COUNT ?? 3000);

export const NOTIFICATION_TOPIC_NAME = 'notification';
