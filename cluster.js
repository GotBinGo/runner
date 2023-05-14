import { WebSocketServer } from 'ws';
import * as crypto from 'crypto';

const wss = new WebSocketServer({ port: 8080 });


let n = 0;
var lastN = 0

setInterval(() => {
	// console.log(n, n-lastN);
    // console.log(Object.keys(connections));
    console.log(connections.filter(x => x).map((x) => {
        return {id: x.id, data: x.data};
    }));
	lastN = n;
}, 1000);

let tasklist = {}; //callbacks
let nextConnectionIndex = 0;
let connections = [];


wss.on('connection', function connection(ws) {
    let connectionIndex = nextConnectionIndex++;
    let conn = {id: connectionIndex, ws, data: {}};
    connections[connectionIndex] = conn;

	ws.on('error', () => {
	});

	ws.onclose = () => {
        delete connections[connectionIndex];
	};

	ws.on('message', function message(rawData) {
	// console.log('received: %s', rawData);
	const data = JSON.parse(rawData);

	if(data.type == 'result') {
		processResult(data);
	}
	});

	function processResult(data) {
		// console.log(data.function, data.params, data.result)
        if(tasklist[data.uuid]) {
            tasklist[data.uuid](data.result);
            delete tasklist[data.uuid];
        }

		if(data.params[0] * 2 == data.result) {
			n++;
		}
	}



	function tt() {
		// sendTask('alma', [5], x => console.log(x));
		sendTask('ip', [], x => {
            conn.data.ip = x;
        });
		setTimeout(tt, 1000);
	}

	for(var i = 0; i < 1; i ++)
		setTimeout(tt, 1);

	function sendTask(fnName, params, cb) {
        params =  [params].flat();
		params = params && params.length ? params : [];
        const uuid = crypto.randomUUID();
        if(cb)
            tasklist[uuid] = cb;
		sendJson(task(fnName, params, uuid));
	}

	function sendJson(x) {
		ws.send(JSON.stringify(x));
	}

	function task(fn, params, uuid) {
		return {
			type: 'task',
			uuid: uuid,
			function: fn,
			params: params
		}
	}
});
