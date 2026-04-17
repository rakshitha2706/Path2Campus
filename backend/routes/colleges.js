const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EapcetCollege = require('../models/EapcetCollege');
const JosaCollege = require('../models/JosaCollege');
const { protect } = require('../middleware/auth');

// POST /api/colleges/save
router.post('/save', protect, async (req, res) => {
  try {
    const { exam, collegeId } = req.body;
    const user = req.user;
    const already = user.savedColleges.some(
      s => s.exam === exam && s.collegeId.toString() === collegeId
    );
    if (already) return res.status(400).json({ message: 'Already saved' });
    user.savedColleges.push({ exam, collegeId });
    await user.save();
    res.json({ message: 'College saved', savedColleges: user.savedColleges });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/colleges/save/:exam/:collegeId
router.delete('/save/:exam/:collegeId', protect, async (req, res) => {
  try {
    const { exam, collegeId } = req.params;
    req.user.savedColleges = req.user.savedColleges.filter(
      s => !(s.exam === exam && s.collegeId.toString() === collegeId)
    );
    await req.user.save();
    res.json({ message: 'College removed', savedColleges: req.user.savedColleges });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/colleges/saved
router.get('/saved', protect, async (req, res) => {
  try {
    const saved = req.user.savedColleges;
    const eapcetIds = saved.filter(s => s.exam === 'eapcet').map(s => s.collegeId);
    const josaaIds = saved.filter(s => s.exam === 'josaa').map(s => s.collegeId);

    const [eapcetColleges, josaaColleges] = await Promise.all([
      EapcetCollege.find({ _id: { $in: eapcetIds } }),
      JosaCollege.find({ _id: { $in: josaaIds } }),
    ]);

    res.json({
      eapcet: eapcetColleges,
      josaa: josaaColleges,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
