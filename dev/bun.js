let n = 0;
var lastN = 0

setInterval(() => {
	console.log(n, n-lastN);
	lastN = n;
}, 1000);

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
      message(ws, rawData) {
        // console.log(rawData);
        const data = JSON.parse(rawData);
        // console.log(data)
          if(data.type == 'result') {
              processResult(data);
          }
  
          function processResult(data) {
              // console.log(data.function, data.params, data.result)
              if(data.params[0] * 2 == data.result) {
                  n++;
              }
          } 
      },
      open(ws) {
        function sendTask(ws, fnName, params) {
          params = params && params.length ? params : [];
          sendJson(ws, task(fnName, params));
      }
  
      function sendJson(ws, x) {
          ws.send(JSON.stringify(x));
      }
  
      function task(fn, params) {
          return {
              type: 'task',
              function: fn,
              params: params
          }
      }
    
        function tt() {
            for(var i = 0; i < 20; i ++)
              sendTask(ws, 'alma', [Math.random()]);
            setTimeout(tt, 10);
        }
        for(var i = 0; i < 600; i ++)
            setTimeout(tt, 1);
      },
      close(ws, code, message) {}, // a socket is closed
      drain(ws) {}, // the socket is ready to receive more data
    },
  });