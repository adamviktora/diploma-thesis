import Redis from 'ioredis';
import { POD_NUMBER } from './podMetadata.js';

export const redis = new Redis({
  host: 'redis-master.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});

export const getRedisKeys = async () => await redis.keys('*');

export const deleteAllRedisKeys = async () => {
  const keys = await getRedisKeys();
  if (keys.length) {
    redis.del(...keys);
  }
};

const podRedisKey = `pod:${POD_NUMBER}`;
const getUserRedisKey = (userId: string) => `userPodNums:${userId}`;

export const addUserPodConnection = async (userId: string) => {
  await redis.sadd(getUserRedisKey(userId), POD_NUMBER);
  await redis.sadd(podRedisKey, userId);
};

export const removeUserPodConnection = async (userId: string) => {
  await redis.srem(getUserRedisKey(userId), POD_NUMBER);
  await redis.srem(podRedisKey, userId);
};

export const cleanupOnPodRestart = async () => {
  const userIds = await redis.smembers(podRedisKey);
  for (const userId of userIds) {
    await redis.srem(getUserRedisKey(userId), POD_NUMBER);
  }
  await redis.del(podRedisKey);
};
