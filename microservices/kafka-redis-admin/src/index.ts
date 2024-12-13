import express from 'express';
import { kafka } from './kafkaSetup.js';
import {
  deleteAllRedisKeys,
  getRedisKeyMembers,
  getRedisKeys,
} from './redisSetup.js';

const app = express();
const port = 7000;
app.use(express.json());

const admin = kafka.admin();
await admin.connect();

app.get('/topics', async (_req, res) => {
  try {
    const topicMetadata = await admin.fetchTopicMetadata();
    res.status(200).json(topicMetadata);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.post('/topics', async (req, res) => {
  try {
    console.log(req.body);
    const { topic, numPartitions, replicationFactor } = req.body;

    const created = await admin.createTopics({
      topics: [{ topic, numPartitions, replicationFactor }],
    });

    if (created) {
      res.status(200).send(`Topic ${topic} created`);
    } else {
      res.status(500).json({ error: 'Failed to create topic' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.delete('/topics/:topic', async (req, res) => {
  try {
    const topic = req.params.topic;
    await admin.deleteTopics({ topics: [topic] });
    res.status(200).send(`Topic ${topic} deleted`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.get('/redisKeys', async (_req, res) => {
  try {
    const redisKeys = await getRedisKeys();
    res.status(200).json({ keys: redisKeys });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get redis keys' });
  }
});

app.get('/redisKeys/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const members = await getRedisKeyMembers(key);
    res.status(200).json({ [key]: members });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get redis members' });
  }
});

app.delete('/redisKeys', async (_req, res) => {
  try {
    await deleteAllRedisKeys();
    res.status(201).send('Deleted');
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete redis keys' });
  }
});

app.listen(port, () => {
  console.log(`Service started on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Disconnecting Kafka admin...');
  await admin.disconnect();
  process.exit(0);
});
