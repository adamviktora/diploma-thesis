import {
  PARTITION_COUNT_NOTIFICATION_TARGETED,
  WS_PODS_COUNT,
} from './constants.js';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
const pickRandom = <T>(array: T[]) => array[getRandomInt(array.length)];

const partitions = [...Array(PARTITION_COUNT_NOTIFICATION_TARGETED).keys()];

export const pickPartition = (podNum: number) => {
  const availablePartitions = partitions.filter(
    (p) => p % WS_PODS_COUNT === podNum
  );
  return pickRandom(availablePartitions);
};
