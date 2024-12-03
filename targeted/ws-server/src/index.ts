import { WebSocket, WebSocketServer } from 'ws';
import {
  kafka,
  PerPodPartitionAssigner,
  POD_NAME,
  POD_NUMBER,
} from './kafkaSetup.js';
import { deleteAllRedisKeys, redisMaster } from './redisSetup.js';

if (POD_NUMBER === 0) {
  await deleteAllRedisKeys();
}

const wss = new WebSocketServer({ port: 3000 });
const wsConnections = new Map<string, Set<WebSocket>>();

wss.on('connection', (socket) => {
  socket.on('message', async (message) => {
    const incomingObject = JSON.parse(message.toString());

    if (incomingObject.type === 'USER_CONNECTION') {
      const userId = incomingObject.userId;

      if (wsConnections.has(userId)) {
        const sockets = wsConnections.get(userId);
        wsConnections.set(userId, sockets.add(socket));
      } else {
        wsConnections.set(userId, new Set([socket]));
      }

      const connectionSuccessMessage = `--> User ${userId} succesfully connected on the WS server, pod name: "${POD_NAME}"`;
      socket.send(connectionSuccessMessage);
      console.log(connectionSuccessMessage);
      console.log(`# Number of users connected: ${wsConnections.size}`);

      await redisMaster.sadd(`userPodNums:${userId}`, POD_NUMBER);
    }
  });

  socket.on('close', async () => {
    for (const [userId, sockets] of wsConnections.entries()) {
      if (sockets.has(socket)) {
        sockets.delete(socket);
        console.log(`--x User ${userId} disconnected from the WS server`);

        if (sockets.size === 0) {
          wsConnections.delete(userId);
          redisMaster.srem(`userPodNums:${userId}`, POD_NUMBER);
        } else {
          wsConnections.set(userId, sockets);
        }
        return;
      }
    }
  });
});

// KAFKA
const consumer = kafka.consumer({
  groupId: `ws-server-notifications-consumer`,
  partitionAssigners: [PerPodPartitionAssigner],
});

await consumer.connect();
await consumer.subscribe({
  topic: `notification-partitioned`,
  fromBeginning: false,
});

await consumer.run({
  eachMessage: async ({ topic, partition, message: kafkaMessage }) => {
    //console.log(`topic: ${topic}, partition: ${partition}`);

    const kafkaMessageValue = kafkaMessage.value?.toString();
    if (!kafkaMessageValue) {
      console.log('Kafka message parsing error');
      return;
    }

    const { userId, message } = JSON.parse(kafkaMessageValue);

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
