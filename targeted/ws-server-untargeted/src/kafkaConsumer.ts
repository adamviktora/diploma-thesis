import { kafka, POD_NAME } from './kafkaSetup.js';
import { wsConnections } from './webSockets.js';

const consumer = kafka.consumer({
  groupId: POD_NAME, // each Pod consumes the whole topic, so it must have unique groupId
});

await consumer.connect();
await consumer.subscribe({
  topic: `notification`,
});

export const forwardEventsToWebSockets = async () => {
  await consumer.run({
    eachMessage: async ({ message: kafkaMessage }) => {
      if (!kafkaMessage.value) {
        console.log('Kafka message does not have value');
        return;
      }

      const { userId, message } = JSON.parse(kafkaMessage.value.toString());

      console.log(`==> Received notification for user ${userId}`);

      const userWebsockets = wsConnections.get(userId);

      if (!userWebsockets || userWebsockets.size === 0) {
        console.log(
          `✗ No WebSocket connection found on ${POD_NAME} for user ${userId}`
        );
      } else {
        console.log(`✓ Sending notification for user ${userId}`);
        userWebsockets.forEach((ws) => ws.send(message));
      }
    },
  });
};
