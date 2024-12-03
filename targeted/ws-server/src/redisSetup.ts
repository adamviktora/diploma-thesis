import Redis from 'ioredis';

export const redisMaster = new Redis({
  host: 'redis-master.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});

export const getRedisKeys = async () => await redisMaster.keys('*');

export const deleteAllRedisKeys = async () => {
  const keys = await getRedisKeys();
  if (keys.length) {
    redisMaster.del(...keys);
  }
};
