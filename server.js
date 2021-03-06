const path=require('path');
const http=require('http');
const express = require('express');
const socketio=require('socket.io');

const app=express();
const server=http.createServer(app); 
const io=socketio(server);
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser}=require('./utils/users');

//Set static folder 
app.use(express.static(path.join(__dirname,'public')));
app.get('/', function(req, res){
    res.redirect('./index.html');
 });
const botName="Admin";

//Run when client connects
io.on('connection', socket=>{
    socket.on('joinRoom',({username,room})=>{
        
        const user=userJoin(socket.id,username,room);

        socket.join(user.room);
        //Welcome User
        socket.emit('message', formatMessage(botName, 'Welcome to ChatBot Room'));

        //Broadcast when user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`));
    });
 
    //Listen for chatMessage
    socket.on('chatMessage', (msg)=>{
        io.emit('message', formatMessage('user', msg));
    });

    //Runs when client dissconnects
    socket.on('disconnect',()=>{
        io.emit('message',formatMessage(botName, 'A user has left the chat'));
    });

});

const PORT=3000 || process.env.PORT;

server.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));