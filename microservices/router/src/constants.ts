export const WS_PODS_COUNT = Number(process.env.WS_PODS_COUNT ?? 3);
export const PARTITION_COUNT_NOTIFICATION_TARGETED = Number(
  process.env.PARTITION_COUNT_NOTIFICATION_TARGETED ?? 3
);

export const NOTIFICATION_CONSUMED_TOPIC_NAME = 'notification';
export const NOTIFICATION_TARGETED_TOPIC_NAME = 'notification-targeted';
export const NOTIFICATION_GENERAL_TOPIC_NAME = 'notification-general';
