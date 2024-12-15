export const POD_NAME = process.env.POD_NAME ?? 'local_pod_name';

// StatefulSet generates pod name with a number at the end from 0 to (NumOfPods - 1)
export const POD_NUMBER = Number(POD_NAME.slice(-1));

export const PODS_COUNT = Number(process.env.PODS_COUNT ?? 3);
