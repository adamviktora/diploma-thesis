import { Kafka } from 'kafkajs';
import { createNotification } from './notificationGenerator.js';
import { getRandomInt } from './utils.js';
import { listTopics } from './kafka_helper.js';

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const routerReplicasCount = 3;
const senderCadencyInSeconds = 8;

const kafka = new Kafka({
  clientId: 'producer',
  brokers: ['kafka.default.svc.cluster.local:9092'],
  ssl: false,
  sasl: {
    mechanism: 'scram-sha-256',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

await listTopics(kafka);

//await createTopic('notification');
//await printInfo('notification');

const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

await producer.connect();

setInterval(async () => {
  await producer.send({
    topic: 'notification',

    messages: [
      {
        value: JSON.stringify(createNotification()),
        partition: getRandomInt(routerReplicasCount),
      },
    ],
  });
}, senderCadencyInSeconds * 1000);

//await producer.disconnect();
