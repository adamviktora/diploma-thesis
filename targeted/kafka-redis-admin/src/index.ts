import express from 'express';
import { routerReplicasCount, wsServerReplicasCount } from './constants.js';
import { createTopic, getAllTopicsInfo } from './kafkaHelper.js';
import { kafka } from './kafkaSetup.js';
import {
  deleteAllRedisKeys,
  getRedisKeyMembers,
  getRedisKeys,
} from './redisSetup.js';

const app = express();
const port = 7000;

const admin = kafka.admin();
await admin.connect();

// await admin.deleteTopics({
//   topics: ['notification', 'notification-partitioned'],
// });

// await printAllTopicsInfo(admin);

// await createTopic(admin, 'notification', routerReplicasCount);
// await createTopic(admin, 'notification-partitioned', wsServerReplicasCount);

app.get('/topics', async (_req, res) => {
  try {
    const topicsInfo = await getAllTopicsInfo(admin);
    res.status(200).json({ topics: topicsInfo });
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
