import { ITopicConfig, Kafka } from 'kafkajs';

export const printTopicInfo = async (kafka: Kafka, topicName: string) => {
  const admin = kafka.admin();
  await admin.connect();

  const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });

  console.log(metadata);
  console.log(metadata.topics[0].partitions);

  await admin.disconnect();
};

export const createTopic = async (kafka: Kafka, topicName: string) => {
  const admin = kafka.admin();
  await admin.connect();

  const topicsToCreate: ITopicConfig[] = [
    {
      topic: topicName,
      numPartitions: 3,
      replicationFactor: 1,
    },
  ];

  const topicsCreated = await admin.createTopics({
    topics: topicsToCreate,
  });

  if (topicsCreated) {
    console.log(`Topic ${topicName} created successfully`);
  } else {
    console.log(`Topic ${topicName} already exists`);
  }

  await admin.disconnect();
};

export const printTopicsList = async (kafka: Kafka) => {
  const admin = kafka.admin();
  await admin.connect();

  console.log(await admin.listTopics());

  await admin.disconnect();
};
