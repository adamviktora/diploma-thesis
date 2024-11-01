import Redis from 'ioredis';

export const redisMaster = new Redis({
  host: 'redis-master.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});
