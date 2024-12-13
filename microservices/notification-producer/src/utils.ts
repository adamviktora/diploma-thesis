export const getRandomInt = (max: number) => Math.floor(Math.random() * max);
export const pickRandom = <T>(array: T[]) => array[getRandomInt(array.length)];
