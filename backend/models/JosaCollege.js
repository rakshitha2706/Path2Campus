const mongoose = require('mongoose');

const JosaCollegeSchema = new mongoose.Schema({
  institute: { type: String, index: true },
  program_name: { type: String, index: true },
  quota: { type: String, index: true },
  seat_type: { type: String, index: true },
  gender: { type: String, index: true },
  opening_rank: Number,
  closing_rank: Number,
  round: { type: Number, default: 1 },
  year: { type: Number, default: 2024 },
  institute_type: { type: String, index: true } // IIT, NIT, IIIT, GFTI etc.
});

module.exports = mongoose.model('JosaCollege', JosaCollegeSchema);
