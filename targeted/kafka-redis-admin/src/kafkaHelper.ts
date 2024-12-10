import { Admin, ITopicConfig } from 'kafkajs';

export const printTopicInfo = async (admin: Admin, topicName: string) => {
  const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });

  console.log(metadata);
  console.log(metadata.topics[0].partitions);
};

export const getAllTopicsInfo = async (admin: Admin) => {
  const metadata = await admin.fetchTopicMetadata();

  return metadata.topics.map((topicData) => ({
    topicName: topicData.name,
    partitionsCount: topicData.partitions.length,
  }));
};

export const createTopic = async (
  admin: Admin,
  topicName: string,
  partitionsCount: number
) => {
  const topicsToCreate: ITopicConfig[] = [
    {
      topic: topicName,
      numPartitions: partitionsCount,
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
};
