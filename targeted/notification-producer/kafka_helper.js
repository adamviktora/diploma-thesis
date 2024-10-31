export const printInfo = async (kafka, topicName) => {
  const admin = kafka.admin();
  await admin.connect();

  const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });

  console.log(metadata);
  console.log(metadata.topics[0].partitions);

  await admin.disconnect();
};

export const createTopic = async (kafka, topicName) => {
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

export const listTopics = async (kafka) => {
  const admin = kafka.admin();
  await admin.connect();

  console.log(await admin.listTopics());

  await admin.disconnect();
};
