import { WebSocketServer } from 'ws';
import { forwardEventsToWebSockets } from './kafkaConsumer.js';
import { onWebSocketConnection } from './webSockets.js';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', onWebSocketConnection);

// Kafka consumer
forwardEventsToWebSockets();
