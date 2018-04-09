const url = require('url');
const WebSocket = require('ws');
const Kafka = require('../helpers/kafka');


class WSHelper {
  constructor(server) {
    const wss = new WebSocket.Server({
      server,
    });

    wss.on('connection', (ws, req) => {
      const location = url.parse(req.url, true);
      // You might use location.query.access_token to authenticate or share sessions
      // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

      ws.on('message', (message) => {
        console.log('received: %s', message);
        ws.send(message);
        // CWD: TODO: post back to kafka bus
      });

      ws.send(JSON.stringify({
        text: 'starting up',
      }));

      const kafka = new Kafka((message) => { // CWD-- this will all need to be reworked
        ws.send(JSON.stringify({
          text: message.payload.timestamp,
          payload: message,
        }));
      });

      kafka.run();
    });
  }
}

module.exports = WSHelper;
