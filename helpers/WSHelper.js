const url = require('url');
const WebSocket = require('ws');
const Kafka = require('../helpers/kafka');
const logger = require('./logger');

class WSHelper {
  constructor(server) {
    const wss = new WebSocket.Server({
      server,
    });

    const kafka = new Kafka();

    wss.on('connection', (ws, req) => {
      const location = url.parse(req.url, true);
      // You might use location.query.access_token to authenticate or share sessions
      // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
      kafka.addProcessor((message) => {
        const kafkaEvent = JSON.parse(message.value);
        ws.send(JSON.stringify({
          text: message.topic,
          originator: kafkaEvent.originator,
          timestamp: kafkaEvent.timestamp,
          payload: JSON.parse(kafkaEvent.payload),
        }));
      });

      ws.on('message', (message) => {
        logger.debug('received: %s', message);
        ws.send(message);
        // CWD: TODO: post back to kafka bus
      });

      ws.send(JSON.stringify({
        text: 'starting up',
      }));
    });

    kafka.run();
  }
}

module.exports = WSHelper;
