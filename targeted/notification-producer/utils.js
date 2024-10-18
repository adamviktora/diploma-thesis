export const getRandomInt = (max) => Math.floor(Math.random() * max);
export const pickRandom = (array) => array[getRandomInt(array.length)];
