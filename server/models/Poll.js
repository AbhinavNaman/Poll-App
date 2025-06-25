const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  question: { type: String, required: true },
  options: [String],
  results: {
    type: Map,
    of: Number,
    default: {},
  },
  answeredCount: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  duration: { type: Number, default: 60 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Poll', PollSchema);
