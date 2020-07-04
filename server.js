const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messageFormat');
const { joinUser, getCurrentUser, leaveChat, getRoomUsers} = require('./utils/users');

const PORT = 3000 || process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const ADMIN = 'Admin';

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
    
    socket.on('joinRoom', ({ username, room }) => {

        const user = joinUser(socket.id, username, room);

        socket.join(user.room);

        // Current User
        socket.emit('message', formatMessage(ADMIN,'Welcome to the chat'));

        // Broadcase when a client connects
        socket.broadcast.to(user.room).emit('message', formatMessage(ADMIN,`${user.username} has joined the chat`));

        // Send users and room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {

        const user = leaveChat(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(ADMIN,`${user.username} has left the chat`));

            // Send users and room info 
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
    });

});

// Run server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});