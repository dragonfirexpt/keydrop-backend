const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  console.log('🟢 Client connected');
  broadcastUserCount();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Handle drop events
      if (data.event === 'requestDrop' && data.drop) {
        console.log('📦 Broadcasting drop to all clients...');
        const payload = JSON.stringify({
          event: 'newDrop',
          drop: data.drop
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }

    } catch (err) {
      console.error('❌ Failed to parse message:', message);
    }
  });

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
    broadcastUserCount();
  });
});

function broadcastUserCount() {
  const payload = JSON.stringify({
    event: 'userCount',
    count: wss.clients.size
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log(`✅ WebSocket server running on port ${PORT}`);
