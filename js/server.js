var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var messages = [];
var path = require('path');
app.use(require('express').static(path.join(__dirname, 'public')));

var msgObj = {message:undefined, user:undefined};
function MsgObj(message, user) {
	this.message = message;
	this.user = user;
}
var userObj = {id:undefined, name:undefined};
function UserObj(id, name) {
	this.id = id;
	this.name = name;
}

app.get('/chat', function(req, res) {
	console.log("html going to render");
	fs.readFile("../chat.html", function (err, content) {
		res.write(content);
		res.end();
	});
});

// To load html page
app.get('/*', function(req, res) {
	console.log("html going to render");
	res.writeHead(404);
	res.end("Page Not Found");
});

var users = [];
io.on('connection', function(client){
  
  client.on("join", function(name) {
	client.username = name;
	users.push(new UserObj(client.id, client.username));
	console.log(client.username + " : " + client.id);
	io.sockets.emit("users", users);
	messages.push(new MsgObj(client.username +" is joined", "info"));
	io.sockets.emit("messages", messages);
  });

  client.on('disconnect', function(){
	for(var i = 0; i < users.length; i++) {
		if(users[i].name == client.username) {
			users.splice(i, 1);
		}
	}
	messages.push(new MsgObj(client.username +" is disconnected", "info"));
	io.sockets.emit("messages", messages);
	io.sockets.emit("users", users);
  });
  
  client.on("messages", function(msg, type) {
	console.log(type);
	if(type == "group") {
		messages.push(new MsgObj(client.username +" : "+msg, client.username));
		io.sockets.emit("messages", messages);
	} else {
		
		messages.push(new MsgObj(client.username +" : "+msg, client.username));
		io.to(type).emit("messages", messages);
	}
	
  });
});

http.listen(8000, function(){
  console.log('Chat Server is listening on port:8000');
});