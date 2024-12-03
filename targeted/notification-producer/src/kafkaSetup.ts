import { Kafka } from 'kafkajs';

const kafkaUsername = process.env.KAFKA_USERNAME ?? 'local_kafka_username';
const kafkaPassword = process.env.KAFKA_PASSWORD ?? 'local_kafka_password';

export const kafka = new Kafka({
  clientId: 'producer',
  brokers: ['kafka.default.svc.cluster.local:9092'],
  ssl: false,
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});
