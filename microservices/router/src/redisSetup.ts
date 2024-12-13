import Redis from 'ioredis';

export const redisReplicas = new Redis({
  host: 'redis-replicas.default.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});
