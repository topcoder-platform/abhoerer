

const kafka = require('kafka-node');
const config = require('config');
const _ = require('lodash');
const logger = require('./logger');

const Offset = kafka.Offset;

class Kafka {
  constructor(processor) {
    this.processors = [];
    const p = _.isFunction(processor) ? processor : (message) => {
      let payload = null;

      try {
        payload = JSON.parse(message.payload);
        logger.debug(payload);
      } catch (err) {
        logger.error(`"message" is not a valid JSON-formatted string: ${err.message}`);
      }

      return payload;
    };

    this.addProcessor(p);
    this.client = new kafka.KafkaClient(config.KAFKA_OPTIONS);
    this.consumer = new kafka.Consumer(this.client, [{ topic: config.TOPIC, partition: config.PARTITION }], { autoCommit: true });
    this.consumer.setOffset(config.TOPIC, 0, 0);
    this.offset = new Offset(this.client);
    logger.info(`connecting on topic: ${config.TOPIC}`);
  }

  addProcessor(processor) {
    this.processors.push(processor);
  }

  run() {
    this.consumer.on('error', (err) => {
      logger.error(err);
    });

    this.consumer.on('offsetOutOfRange', (topic) => {
      logger.debug(topic);
      logger.info('offset OutOfRange. resetting.');
      this.offset.fetch([topic], (errOffsetFetch, offsets) => {
        if (errOffsetFetch) {
          logger.error(errOffsetFetch);
          return console.error(errOffsetFetch);
        }

        const min = Math.min(offsets[topic.topic][topic.partition]);
        logger.info(`Setting offset to ${min}`);
        return this.consumer.setOffset(config.TOPIC, topic.partition, min);
      });
    });

    this.consumer.on('message', (message) => {
      logger.info(`received message from kafka: ${JSON.stringify(message)}`);
      _.forEach(this.processors, (p) => {
        p(message);
      });
    });
  }
}

module.exports = Kafka;
