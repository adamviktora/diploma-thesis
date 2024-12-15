import { kafka } from './kafkaSetup.js';
import { redisReplicas } from './redisSetup.js';
import {
  WS_PODS_COUNT,
  NOTIFICATION_CONSUMED_TOPIC_NAME,
} from './constants.js';
import {
  publishMessageOnGeneralTopic,
  publishMessageOnPartition,
} from './kafkaProducer.js';

const consumer = kafka.consumer({ groupId: 'router-group' });
await consumer.connect();
await consumer.subscribe({ topic: NOTIFICATION_CONSUMED_TOPIC_NAME });

await consumer.run({
  eachMessage: async ({ message }) => {
    if (!message.value) {
      return;
    }

    const { data } = JSON.parse(message.value.toString());
    const { usernames, organizations, roles } = data;
    console.log(usernames);

    // organizations consist of a large number of users, there is a very little chance that the users in them are not connected to all ws-server pods
    // roles are not that large, but the computational overhead would still be high
    if ((organizations && organizations.length) || (roles && roles.length)) {
      publishMessageOnGeneralTopic(message);
      return;
    }

    const allPodNumbers = new Set<string>();

    for (const userId of usernames) {
      const podNumbers = await redisReplicas.smembers(`userPodNums:${userId}`);

      for (const podNumber of podNumbers) {
        allPodNumbers.add(podNumber);
      }

      // if the number of pods, which would consume this message is more than half (for odd numbers half + 1) of all the pods, simply publish on the general topic
      if (allPodNumbers.size > (WS_PODS_COUNT + 1) / 2) {
        publishMessageOnGeneralTopic(message);
        return;
      }
    }

    if (allPodNumbers.size) {
      allPodNumbers.forEach(async (podNum) => {
        publishMessageOnPartition(message, Number(podNum));
      });
    } else {
      console.log(`✗ Users ${usernames} are not connected on any WS server`);
    }
  },
});
