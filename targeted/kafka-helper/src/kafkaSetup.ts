import { Kafka } from 'kafkajs';

const kafkaUsername = process.env.KAFKA_USERNAME ?? 'local_kafka_username';
const kafkaPassword = process.env.KAFKA_PASSWORD ?? 'local_kafka_password';

const kafkaBrokersCount = 3;

const kafkaBrokers = [...Array(kafkaBrokersCount).keys()].map(
  (number) =>
    `kafka-controller-${number}.kafka-controller-headless.default.svc.cluster.local:9092`
);

export const kafka = new Kafka({
  clientId: 'producer',
  brokers: [kafkaBrokers[0]],
  ssl: false,
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});
