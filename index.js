const io = require('socket.io-client');
const socket = io.connect('http://tiene.us-3.evennode.com:7035');

socket.on('connect', () => {
  console.log('Successfully connected!');
});
