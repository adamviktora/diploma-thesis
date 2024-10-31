import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

const redisReplicas = new Redis({
  host: 'redis-replicas.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
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

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: 'notification', fromBeginning: true });

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});
await producer.connect();

const redisKeys = await redisReplicas.keys('*');
console.log('redisKeys');
console.log(redisKeys);

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log(`topic: ${topic}, partition: ${partition}`);

    const { userId } = JSON.parse(message.value.toString());

    const podName = await redisReplicas.get(userId);
    // TODO: there may be a list of podNames in case when user is logged in on more devices / browser tabs

    if (podName) {
      console.log(
        `sending notification for user: ${userId} to pod: ${podName}`
      );
      await producer.send({
        topic: `notification-${podName}`,
        messages: [message],
      });
    } else {
      // TODO: how to handle such cases? We can't just ignore the message
      // --> send it to some general topic which will be picked up after user connects?
      console.log(`User ${userId} is not yet connected on a WS server`);
    }
  },
});
