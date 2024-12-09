import { Kafka, PartitionAssigner, AssignerProtocol } from 'kafkajs';

const kafkaUsername = process.env.KAFKA_USERNAME ?? 'local_kafka_username';
const kafkaPassword = process.env.KAFKA_PASSWORD ?? 'local_kafka_password';

export const POD_NAME = process.env.POD_NAME ?? 'local_pod_name';

// StatefulSet generates pod name with a number at the end from 0 to (NumOfPods - 1)
export const POD_NUMBER = Number(POD_NAME.slice(-1));

export const kafka = new Kafka({
  clientId: `${POD_NUMBER}`, // necessary for PerPodPartitionAssigner to work
  brokers: ['kafka.default.svc.cluster.local:9092'],
  ssl: false,
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

export const PerPodPartitionAssigner: PartitionAssigner = ({ cluster }) => ({
  name: 'PerPodPartitionAssigner',
  version: 1,

  async assign({ members, topics }) {
    const assignment = {};

    members.forEach((member) => {
      const memberId = member.memberId;

      // memberId starts with Kafka clientId: (clientId)_(rest-of-the-member-id)
      const memberPartition = Number(memberId[0]);
      const topic = topics[0];

      assignment[memberId] = {
        [topic]: [memberPartition],
      };
    });

    return Object.keys(assignment).map((memberId) => ({
      memberId,
      memberAssignment: AssignerProtocol.MemberAssignment.encode({
        version: this.version,
        assignment: assignment[memberId],
        userData: null,
      }),
    }));
  },

  protocol({ topics }) {
    return {
      name: this.name,
      metadata: AssignerProtocol.MemberMetadata.encode({
        version: this.version,
        topics: topics,
        userData: null,
      }),
    };
  },
});
