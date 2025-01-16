export default {
  register({ strapi }) {
    const wss = new (require('ws').Server)({ noServer: true });
    wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');

      ws.on('message', (message) => {
        console.log('Received:', message.toString());
        ws.send(message.toString());
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
    strapi.server.httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(
        request.url,
        `http://${request.headers.host}`
      ).pathname;

      if (pathname === '/websocket') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  },
  bootstrap({ strapi }) {},
  destroy({ strapi }) {},
};