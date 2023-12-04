const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

const connections = [null, null]

io.on('connection', (socket) => {
    let playerIndex = -1;
    for (const i in connections){
        if (connections[i]==null) {
            playerIndex = i
            break
        }
    }

    socket.emit('player-number', playerIndex);
    
    if (playerIndex === -1) 
    return;
    connections[playerIndex] = false;
    
    socket.broadcast.emit('player-connection', playerIndex);

    socket.on('disconnect', () => {
        connections[playerIndex] = null;
        socket.broadcast.emit('player-connection', playerIndex);
    })

    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex);
        connections[playerIndex] = true;
    });

    socket.on('check-players', () => {
        const players = [];
        for (const i in connections){
            connections[i] === null ? players.push({connected: false}) :
            players.push({connected: true, ready: connections[i]});
        }
        socket.emit('check-players', players);
    })

    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 900000) 
})

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});