const dayjs = require('dayjs');

let counter = 1;

exports.generateOrderNumber = () => {
  const date = dayjs().format('YYYYMMDD');

  const number = String(counter).padStart(4, '0');
  counter++;

  return `ORD-${date}-${number}`;
};
