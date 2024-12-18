import { WebSocket } from 'ws';
import { POD_NAME } from './podMetadata.js';
import { addUserPodConnection, removeUserPodConnection } from './redis.js';

export const wsConnections = new Map<string, Set<WebSocket>>();

export const onWebSocketConnection = (socket: WebSocket) => {
  socket.on('message', async (message) => {
    const incomingObject = JSON.parse(message.toString());

    if (incomingObject.type === 'USER_CONNECTION') {
      // for the sake of this thesis, only userId (username) will be stored
      const userId: string = incomingObject.userId;

      if (wsConnections.has(userId)) {
        const sockets = wsConnections.get(userId);
        wsConnections.set(userId, sockets.add(socket));
      } else {
        wsConnections.set(userId, new Set([socket]));
      }

      const connectionSuccessMessage = `--> User ${userId} succesfully connected on the WS server, pod name: "${POD_NAME}"`;
      socket.send(connectionSuccessMessage);
      console.log(connectionSuccessMessage);
      console.log(`# Number of users connected: ${wsConnections.size}`);

      await addUserPodConnection(userId);
    }
  });

  socket.on('close', async () => {
    for (const [userId, sockets] of wsConnections.entries()) {
      if (sockets.has(socket)) {
        sockets.delete(socket);
        console.log(`--x User ${userId} disconnected from the WS server`);

        if (sockets.size === 0) {
          wsConnections.delete(userId);
          await removeUserPodConnection(userId);
        } else {
          wsConnections.set(userId, sockets);
        }
        return;
      }
    }
  });
};
