import { kafka, PerPodPartitionAssigner } from './kafkaSetup.js';
import { POD_NAME } from './podMetadata.js';
import { wsConnections } from './webSockets.js';

const NOTIFICATION_TARGETED_TOPIC_NAME = 'notification-targeted';
const NOTIFICATION_GENERAL_TOPIC_NAME = 'notification-general';

const targetedConsumer = kafka.consumer({
  groupId: `ws-server-targeted-consumer`,
  partitionAssigners: [PerPodPartitionAssigner],
});

const generalConsumer = kafka.consumer({
  groupId: `${POD_NAME}-general-consumer`, // each pod must be in different consumer group to consume the whole topic
});

await targetedConsumer.connect();
await targetedConsumer.subscribe({
  topic: NOTIFICATION_TARGETED_TOPIC_NAME,
});

await generalConsumer.connect();
await generalConsumer.subscribe({
  topic: NOTIFICATION_GENERAL_TOPIC_NAME,
});

export const forwardEventsToWebSockets = async () => {
  for (const consumer of [targetedConsumer, generalConsumer]) {
    await consumer.run({
      eachMessage: async ({ message: kafkaMessage }) => {
        if (!kafkaMessage.value) {
          console.log('Kafka message does not have value');
          return;
        }

        const { data } = JSON.parse(kafkaMessage.value.toString());

        // for the sake of this thesis only usernames are dealt with
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
            userWebsockets.forEach((ws) =>
              ws.send(JSON.stringify(data.payload))
            );
          }
        }
      },
    });
  }
};
