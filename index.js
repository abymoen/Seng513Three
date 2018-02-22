var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userSet = new Set();

var port = process.env.PORT || 3000;
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  io.emit('user connect', getUsername());

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function() {
    io.emit('chat message','A user has disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

function getUsername() {
  let x = getRandomInt(1000);
  while(userSet.has("user" + x)) x = getRandomInt(1000);
  return "user" + x;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
