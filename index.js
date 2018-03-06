var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userSet = new Set();
var userJSON = {"users":[]};
var messages = [200];
var messageCounter = 0;

var port = process.env.PORT || 3000;
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  let userName = getUsername();
  let userColor = "#000000";

  for(i=0; i<userJSON.users.length; i++) {
    if(userJSON.users[i] !== undefined) {
      io.emit('user add', userJSON.users[i]);
    }
  }
  for(i=0; i<messageCounter; i = (i+1)%200) {
    if(messages[i] !== undefined) {
      io.emit('message add', messages[i]);
    }
  }
  io.emit('user connect', userName);
  userJSON.users.push(userName);

  socket.on('chat message', function(msg){
    let date = new Date();
    let mins = getMins(date);
    let time = date.getHours() + ":" + mins;
    io.emit('chat message', time + " " +  msg, userColor);
    messages[messageCounter] = time + " " +  msg;
    messageCounter = (messageCounter + 1) % 200;
  });

  socket.on('username change', function(names) {
    let users = names.split(" ");
    let orig = users[0];
    let update = users[1];
    for(i=0; i<userJSON.users.length; i++) {
      if(userJSON.users[i] === orig) {
        userJSON.users[i] = update;
        io.emit('user update', userJSON.users[i]);
        io.emit('user disconnect', orig);
        break;
      }
    }
  });

  socket.on('color change', function(color) {
    userColor = "#" + color;
  });

  socket.on('disconnect', function() {
    io.emit('user disconnect', userName);
    deleteUser(userName);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

function getUsername() {
  let x = getRandomInt(1000);
  while(userSet.has("user" + x)) x = getRandomInt(1000);
  userSet.add("user" + x);
  return "user" + x;
}

function deleteUser(userName) {
  for(i=0; i<userJSON.users.length; i++) {
    if(userJSON.users[i] === userName) {
      delete userJSON.users[i];
    }
  }
}

function getMins(date) {
  let x = date.getMinutes();
  if(x == "0" || x == "1" || x == "2" || x == "3" || x == "4" || x == "5" || x == "6" || x == "7" || x == "8" || x == "9") {
    return "0" + x;
  } else {
    return x;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
