import { Admin } from 'kafkajs';

export const printTopicInfo = async (admin: Admin, topicName: string) => {
  const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });

  console.log(metadata);
  console.log(metadata.topics[0].partitions);
};
