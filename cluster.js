import cluster from 'node:cluster'
import ws from 'lark-websocket'
import * as crypto from 'crypto';

let n = 0;
var lastN = 0


const nthreads = 1;

if(cluster.isPrimary) { // make a child process and pipe all ws connections to it
    
    let workers = [];
    let nextWorkerIndex = 0;
    for(var i = 0; i < nthreads; i++) {
        var worker = cluster.fork();
        
        worker.once("online", function() {
            console.log("worker online with pid", worker.process.pid);
        })
        workers.push(worker);
    }

    ws.createServer(function(client, request){
        console.log('SENDING TO WORKER')
        workers[nextWorkerIndex++].send("socket", client._socket); // send all websocket clients to the worker thread
        if(nextWorkerIndex >= workers.length) {
            nextWorkerIndex = 0;
        }
    }).listen(8080);
}
else {
    setInterval(() => {
        console.log(n, n-lastN);
        lastN = n;
    }, 1000);
    process.on("message", function(message, handler) {
        if(message === "socket") { // Note: Node js can only send sockets via handler if message === "socket", because passing sockets between threads is sketchy as fuck
            var client = ws.createClient(handler);

            client.on('message',function(rawData){
                // console.log("worker " + process.pid + " got:", rawData);
                // client.send("I got your: " + msg);
                const data = JSON.parse(rawData);

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



            
            function tt() {
                sendTask('alma', [Math.random()]);

                setTimeout(tt, 1);
            }

            for(var i = 0; i < 300; i ++)
		        setTimeout(tt, 1);

            function sendTask(fnName, params) {
                params = params && params.length ? params : [];
                sendJson(task(fnName, params));
            }
        
            function sendJson(x) {
                try {

                    client.send(JSON.stringify(x));
                } catch(e) {
                    console.log('e')
                }
            }
        
            function task(fn, params) {
                return {
                    type: 'task',
                    uuid: crypto.randomUUID(),
                    function: fn,
                    params: params
                }
            }
        }
    });
}