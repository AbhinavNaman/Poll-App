const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    passwordHash: String,
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);