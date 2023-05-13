import { WebSocketServer } from 'ws';
import * as crypto from 'crypto';

const wss = new WebSocketServer({ port: 8080 });
let n = 0;
var lastN = 0
setInterval(() => {
	console.log(n, n-lastN);
	lastN = n;
}, 200);

wss.on('connection', function connection(ws) {
	var intervals = [];
	ws.on('error', () => {
		// clearInterval(interval);
	});

	ws.onclose = () => {
		for(var interval of intervals)
			clearInterval(interval);
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
		if(data.params[0] * 2 == data.result) {
			n++;
		}
	} 

	// function tt() {
	// 	sendTask('alma', [Math.random()]);
	// 	// sendTask('alma', [Math.random()]);
	// 	sendTask('alma', [Math.random()]);
	// 	setTimeout(tt, 1);
	// }

	for(var i = 0; i < 30000; i ++)
		setTimeout(tt, 1);

		// intervals.push(setInterval(() => {
		// 	// n++;
		// 	for(var j = 0; j < 10; j++)
		// 	// sendTask('bela');
		// }, 1));

	function sendTask(fnName, params) {
		params = params && params.length ? params : [];
		sendJson(task(fnName, params));
	}

	function sendJson(x) {
		ws.send(JSON.stringify(x));
	}

	function task(fn, params) {
		return {
			type: 'task',
			uuid: crypto.randomUUID(),
			function: fn,
			params: params
		}
	}
});
