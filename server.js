const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

const connections = [null, null]

io.on('connection', (socket) => {
    console.log('New Connection Established: ');
    let playerIndex = -1;
    for (const i in connections) {
        console.log("Connection Number =", i , "Connected:", connections[i]==null);
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
        console.log(`Player ${playerIndex} has Disconnected`);
        connections[playerIndex] = null;
        socket.broadcast.emit('player-connection', playerIndex);
    })

    socket.on('user-disconnect', () => {
        console.log(`Player ${playerIndex} has Disconnected`);
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

    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id)
        socket.broadcast.emit('fire', id)
    })
    
    socket.on('fire-reply', square => {
        console.log(square)
        socket.broadcast.emit('fire-reply', square)
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