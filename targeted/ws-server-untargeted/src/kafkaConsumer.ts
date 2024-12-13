import { kafka } from './kafkaSetup.js';
import { POD_NAME } from './podMetadata.js';
import { wsConnections } from './webSockets.js';

const NOTIFICATION_TOPIC_NAME = 'notification';

const consumer = kafka.consumer({
  groupId: POD_NAME, // each Pod consumes the whole topic, so it must have unique groupId
});

await consumer.connect();
await consumer.subscribe({
  topic: NOTIFICATION_TOPIC_NAME,
});

export const forwardEventsToWebSockets = async () => {
  await consumer.run({
    eachMessage: async ({ message: kafkaMessage }) => {
      if (!kafkaMessage.value) {
        console.log('Kafka message does not have value');
        return;
      }

      const { data } = JSON.parse(kafkaMessage.value.toString());
      const { usernames } = data;

      console.log(`==> Received notification for users ${usernames}`);

      for (const userId of usernames) {
        const userWebsockets = wsConnections.get(userId);

        if (!userWebsockets || userWebsockets.size === 0) {
          console.log(
            `✗ No WebSocket connection found on ${POD_NAME} for user ${userId}`
          );
        } else {
          console.log(`✓ Sending notification for user ${userId}`);
          userWebsockets.forEach((ws) => ws.send(JSON.stringify(data.payload)));
        }
      }
    },
  });
};
