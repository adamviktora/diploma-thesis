import { WebSocketServer } from 'ws';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

const wss = new WebSocketServer({ port: '3000' });
const wsConnections = new Map();

const podName = process.env.POD_NAME;

const redisMaster = new Redis({
  host: 'redis-master.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});

//redisMaster.del('userA', 'userB', 'userC', 'userD', '1');

wss.on('connection', (socket) => {
  socket.on('message', async (message) => {
    const incomingObject = JSON.parse(message);

    if (incomingObject.type === 'USER_CONNECTION') {
      const userId = incomingObject.userId;
      wsConnections.set(userId, socket);
      // TODO: multiple connections for one user (more browser tabs / devices)

      socket.send(
        `User ${userId} succesfully connected on the server, pod name: "${
          podName ?? 'locally-now'
        }"`
      );

      console.log(`users connected: ${Array.from(wsConnections.keys())}`);

      await redisMaster.sadd(`userPods:${userId}`, podName);
    }
  });

  socket.on('close', async () => {
    const userId = Array.from(wsConnections.entries()).find(
      ([_id, ws]) => ws === socket
    )?.[0];
    if (userId) {
      wsConnections.delete(userId);
      console.log(`WebSocket connection closed for user ${userId}`);

      redisMaster.srem(`userPods:${userId}`, podName);
    }
  });
});

// KAFKA
const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;

const kafka = new Kafka({
  clientId: 'app',
  brokers: ['kafka.default.svc.cluster.local:9092'],
  ssl: false,
  sasl: {
    mechanism: 'scram-sha-256',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

const consumer = kafka.consumer({ groupId: `${podName}` });
await consumer.connect();
await consumer.subscribe({
  topic: `notification-${podName}`,
  fromBeginning: true,
});

await consumer.run({
  eachMessage: async ({ topic, partition, message: kafkaMessage }) => {
    console.log(`topic: ${topic}, partition: ${partition}`);

    const { userId, message } = JSON.parse(kafkaMessage.value.toString());

    console.log(`Received notification for user ${userId}`);

    const userWs = wsConnections.get(userId);

    if (userWs) {
      userWs.send(message);
    } else {
      console.log(
        `No WebSocket connection found on ${podName} for user ${userId}`
      );
    }
  },
});
