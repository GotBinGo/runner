import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';

const masterUrl = 'ws://20.13.166.18:8080';
const workerId = 0;
const ip = '';

let stopped = false;
let n = 0;
var lastN = 0

setInterval(() => {
	console.log(n, n-lastN);
	lastN = n;
}, 1000);
 
const options = {
    WebSocket: WS,
    connectionTimeout: 1000,
    maxRetries: 10,
};


import * as readline from 'readline';

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

process.stdin.on('keypress', (chunk, key) => {
	if (key && key.name == 's')
		stopped = !stopped;
	if (key && key.name == 'q')
		process.exit();
  });

const ws = new ReconnectingWebSocket(masterUrl, [], options);

ws.addEventListener('error', x => console.log('connection error'));

ws.addEventListener('open', function open() {
	start();
	sendJson(info());
	
});

ws.addEventListener('message', function message(rawData) {
	rawData = rawData[Reflect.ownKeys(rawData)[2]];
	// console.log('received: %s', rawData);
	const data = JSON.parse(rawData);

	if(data.type == 'task') {
		processTask(data);
	}
});

async function processTask(data) {
	if(stopped) {
		return;
	}
	var res = tasks[data.function](...data.params);
	sendJson(result(data.function, data.uuid, data.params, await res));
}

const tasks = {
	'alma': async (x) => {
		// console.log('ALMA with param', x, y);
		n++;
		// var resp = (await fetch('http://s13.webtar.hu')).text();
		return 2*x;
	},
	'bela': () => {
		// console.log('BELA');
		return 66;
	}
};

function start() {
	console.log('started')
	setInterval(() => {
		sendJson(info());
	}, 1000000);
	
}
	
function sendJson(x) {
	ws.send(JSON.stringify(x));
}

function result(fn, uuid, params, result) {
	return {
		type: 'result',
		function: fn,
		uuid: uuid,
		params: params,
		result: result
	}
}

function info() {
	return {
		type: 'info',
		workerId: workerId,
		ip: ip
	};
}
