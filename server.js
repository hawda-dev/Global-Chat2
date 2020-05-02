var app = require('express')();
var path = require('path');
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/start.html');
});

function removeItem(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
        }
    }
}

var userList = [];
var userCounter = 0;
var storedMsg = []; // store messages sent by the user

io.on('connection', (socket) => {
    userCounter += 1;
    console.log("User entered.");

    // show all previous messages to new connections
    socket.emit('chatLog', storedMsg);

    socket.on('newuser', function(userName) {
        userList.push(socket.id);
        userList.push(userName);
        io.emit('showUserList', userList);
        console.log(userList);
    });

    socket.on('requestMsg', function(dataInfo) {
        storedMsg.push(dataInfo[0]);
        storedMsg.push(dataInfo[1]);
        io.emit('sendMessage', dataInfo);
    });

    socket.on('disconnect', ()=> {
        const index = userList.indexOf(socket.id);
        userList.splice(index + 1, 1);
        removeItem(userList, socket.id);
        io.emit('showUserList', userList);
        console.log(userList);
        console.log("User left.");
        userCounter -= 1;
    });
});

http.listen(port, () => {
    console.log('listening on *: ' + port);
});
