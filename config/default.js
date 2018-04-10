
const fs = require('fs');

module.exports = {
  KAFKA_OPTIONS: {
    kafkaHost: process.env.KAFKA_HOST || 'localhost:9092',
    sslOptions: {
      cert: process.env.KAFKA_CLIENT_CERT || fs.readFileSync('./kafka_client_prod.crt'),
      key: process.env.KAFKA_CLIENT_CERT_KEY || fs.readFileSync('./kafka_client_prod.key'),
    },
  },
  HOST: '127.0.0.1',
  PORT: 3000,
  WSPORT: 80,
  PARTITION: 0,
  TOPIC: 'notifications.kafka.queue.java.test',
};
