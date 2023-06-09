import cluster from 'node:cluster'
import * as crypto from 'crypto';


let n = 0;
var lastN = 0
const nthreads = 1;

import { setFlagsFromString } from 'v8';
import { runInNewContext } from 'vm';

setFlagsFromString('--expose_gc');
const gc = runInNewContext('gc'); // nocommit
global.gc = gc;

import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';


if(cluster.isPrimary) {
    setInterval(() => {
        global.gc();
        n = ns.reduce((partialSum, a) => partialSum + a, 0)
        console.log(ns)
        console.log(n, n-lastN);
        lastN = n;
    }, 1000);

    const server = createServer();
    var workers = [];
    var ns = [];
    var nextWorkerIndex = 0;



    for(var i = 0; i < nthreads; i++) {
        const worker = cluster.fork();
        var idx = JSON.parse(JSON.stringify(i));
        worker.on("message", ((idx) => (msg) => {
            // console.log(msg, idx)
            ns[idx] = msg
            // console.log('master message from worker', msg);
        })(idx));
        workers.push(worker);
        ns.push(0);
    }


    server.on('upgrade', function upgrade(request, socket, head) {
        const { pathname } = parse(request.url);
        console.log('upgrading')
        //   wss2.handleUpgrade(request, socket, head, function done(ws) {
        //     wss2.emit('connection', ws, request);
        //   });
        workers[nextWorkerIndex].send("socket", socket);
        var req = Object.assign(request);
        req.headers = JSON.parse(JSON.stringify(request.headers));
        // return;
        workers[nextWorkerIndex].send(JSON.stringify({type: 'request', value: {headers: req.headers, ...req}}));
        workers[nextWorkerIndex].send(JSON.stringify({type: 'head', value: head}));
        nextWorkerIndex++;
        if(nextWorkerIndex >= nthreads) nextWorkerIndex = 0;
      });
    server.listen(8080);

} else {
    setInterval(() => {
       process.send(n);
       global.gc();
    }, 1000);

    const wss = new WebSocketServer({ noServer: true });
    var socket = null;
    var request = null;
    var head = null;
    process.on("message", function(message, handler) {
        if(message == 'socket') {
            socket = handler;
            console.log('socket')
        } else {
            message = JSON.parse(message);
            if(message.type == 'request') {
                request = message.value;
                console.log('request')
            } else if(message.type == 'head') {
                head = message.value;
                console.log('head')

                // console.log('wss', request, head)
                console.log('wss')
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    console.log('upg');
                    wss.emit('connection', ws, request);
                });
            }
        }

        // console.log('worker on message', message, handler);

    });

    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);

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
              for(var i = 0; i < 1; i ++) {
                  sendTask(ws, 'alma', [Math.random()]);
              }
              setTimeout(tt, 100);
          }
          for(var i = 0; i < 1; i ++)
              setTimeout(tt, 1);
      
          ws.on('message', (rawData) => {
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
          });
      });

}
