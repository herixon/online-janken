const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/room');
const { calculateResult } = require('./utils');

dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 3000;
    server.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  })
  .catch((err) => {
    console.error(err);
  });

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('join', async (roomKey) => {
    try {
      let room = await Room.findOne({ roomKey });
      if (!room) {
        room = new Room({ roomKey, players: [], choices: [] });
        await room.save();
      }

      if (room.players.length >= 2) {
        socket.emit('error', 'The room is full.');
        return;
      }

      socket.roomKey = roomKey;
      socket.join(roomKey);
      room.players.push(socket.id);
      room.choices.push(null);
      await room.save();

      socket.emit('joined');

      if (room.players.length === 2) {
        io.to(roomKey).emit('game-start');
      }
    } catch (err) {
      console.error(err);
      socket.emit('error', 'An error occurred while joining the room.');
    }
  });

  socket.on('play', async (choice) => {
    try {
      const room = await Room.findOne({ roomKey: socket.roomKey });
      if (!room) {
        socket.emit('error', 'The room does not exist.');
        return;
      }

      const playerIndex = room.players.indexOf(socket.id);
      room.choices.set(playerIndex, choice);
      await room.save();

      if (room.choices.every((c) => c !== null)) {
        const result = calculateResult(room.choices[0], room.choices[1]);
        io.to(socket.roomKey).emit('game-result', result);

        room.gameResults.push(result);
        await room.save();

        io.to(socket.roomKey).emit('game-history', room.gameResults);

        room.choices = [null, null];
        await room.save();
      }
    } catch (err) {
      console.error(err);
      socket.emit('error', 'An error occurred while playing the game.');
    }
  });

  socket.on('disconnect', async () => {
    try {
      const room = await Room.findOne({ roomKey: socket.roomKey });
      if (!room) return;

      const playerIndex = room.players.indexOf(socket.id);
      room.players.splice(playerIndex, 1);
      room.choices.splice(playerIndex, 1);
      await room.save();

      if (room.players.length === 0) {
        await Room.deleteOne({ roomKey: socket.roomKey });
      }
    } catch (err) {
      console.error(err);
    }
  });
});
