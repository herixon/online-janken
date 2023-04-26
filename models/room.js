const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomKey: { type: String, required: true },
  players: [{ type: String }],
  choices: [{ type: String }],
  gameResults: [{ type: String }], // Add this field to store game results
});

module.exports = mongoose.model('Room', roomSchema);