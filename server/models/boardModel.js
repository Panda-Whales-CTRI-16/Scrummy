const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boardSchema = new Schema({
    boardName: { type: String, required: true },
    storage: { type: Array, default: [[],[],[],[]] },
    users: { type: Array, default: [] }
}, { minimize: false });

module.exports = mongoose.model('Board', boardSchema);
