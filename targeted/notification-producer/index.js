import { Kafka } from 'kafkajs';
import { createNotification } from './notificationGenerator.js';
import { getRandomInt } from './utils.js';

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const routerReplicasCount = 3;
const senderCadencyInSeconds = 1;

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

const printInfo = async (topicName) => {
  const admin = kafka.admin();
  await admin.connect();

  const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });

  console.log(metadata);
  console.log(metadata.topics[0].partitions);

  await admin.disconnect();
};

const createTopic = async (topicName) => {
  const admin = kafka.admin();
  await admin.connect();

  const topicsToCreate = [
    {
      topic: topicName,
      numPartitions: 3,
      replicationFactor: 1,
    },
  ];

  const result = await admin.createTopics({
    topics: topicsToCreate,
  });

  if (result) {
    console.log(`Topic ${topicName} created successfully`);
  } else {
    console.log(`Topic ${topicName} already exists`);
  }

  await admin.disconnect();
};

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
