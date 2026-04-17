const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  savedColleges: [
    {
      exam: { type: String, enum: ['eapcet', 'josaa'] },
      collegeId: { type: mongoose.Schema.Types.ObjectId },
      savedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
