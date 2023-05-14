Bun.serve({
    port: 8080,
    fetch(req, server) {
        // upgrade the request to a WebSocket
        console.log('upg')
        if (server.upgrade(req)) {
          return; // do not return a Response
        }
        return new Response("Upgrade failed :(", { status: 500 });
      },
    websocket: {
      message(ws, message) {
        console.log(message);
      },
      open(ws) {}, // a socket is opened
      close(ws, code, message) {}, // a socket is closed
      drain(ws) {}, // the socket is ready to receive more data
    },
  });