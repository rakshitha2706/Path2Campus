const express = require('express');
const router = express.Router();
const JosaCollege = require('../models/JosaCollege');

// Helper: classify
function classify(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return null;
  const ratio = (closingRank - userRank) / closingRank;
  if (ratio > 0.20) return 'safe';
  if (ratio >= -0.10) return 'target';
  return 'dream';
}

// Helper: probability
function probability(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((closingRank - userRank) / closingRank) * 100)));
}

// Helper: fit score
function fitScore(college, userRank, closingRank) {
  let score = 0;
  if (closingRank && userRank <= closingRank) score += 50;
  else score += Math.max(0, 50 - Math.round(((userRank - closingRank) / closingRank) * 50));
  // Bonus for IITs
  if (college.institute_type === 'IIT') score += 30;
  else if (college.institute_type === 'NIT') score += 20;
  else score += 10;
  return Math.min(100, score);
}

// POST /api/josaa/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { rank, quota = 'AI', gender = 'Gender-Neutral', branch, institute_type } = req.body;
    const userRank = parseInt(rank);
    if (!userRank) return res.status(400).json({ message: 'Rank is required' });

    const genderStr = gender === 'Female' ? 'Female-only (including Supernumerary)' : 'Gender-Neutral';

    const query = { quota, gender: genderStr };
    if (branch) query.program_name = { $regex: branch, $options: 'i' };
    if (institute_type) query.institute_type = { $regex: institute_type, $options: 'i' };

    const colleges = await JosaCollege.find(query).limit(800);

    const results = [];
    for (const col of colleges) {
      const closingRank = col.closing_rank;
      if (!closingRank) continue;
      const cat = classify(userRank, closingRank);
      if (!cat) continue;
      const prob = probability(userRank, closingRank);
      const fit = fitScore(col, userRank, closingRank);
      results.push({
        _id: col._id,
        institute: col.institute,
        program_name: col.program_name,
        quota: col.quota,
        seat_type: col.seat_type,
        gender: col.gender,
        opening_rank: col.opening_rank,
        closing_rank: closingRank,
        institute_type: col.institute_type,
        round: col.round,
        admission_probability: prob,
        fit_score: fit,
        classification: cat,
      });
    }

    const safe = results.filter(r => r.classification === 'safe').sort((a, b) => b.admission_probability - a.admission_probability).slice(0, 20);
    const target = results.filter(r => r.classification === 'target').sort((a, b) => b.admission_probability - a.admission_probability).slice(0, 20);
    const dream = results.filter(r => r.classification === 'dream').sort((a, b) => b.closing_rank - a.closing_rank).slice(0, 15);

    res.json({ safe, target, dream, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/josaa/colleges
router.get('/colleges', async (req, res) => {
  try {
    const { branch, institute_type, quota, page = 1, limit = 20 } = req.query;
    const query = {};
    if (branch) query.program_name = { $regex: branch, $options: 'i' };
    if (institute_type) query.institute_type = { $regex: institute_type, $options: 'i' };
    if (quota) query.quota = quota;

    const total = await JosaCollege.countDocuments(query);
    const colleges = await JosaCollege.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ institute: 1 });

    res.json({ colleges, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/josaa/colleges/:id
router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await JosaCollege.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    // Fetch all rounds for same institute+program for trend
    const rounds = await JosaCollege.find({
      institute: college.institute,
      program_name: college.program_name,
      quota: college.quota,
      seat_type: college.seat_type,
      gender: college.gender,
    }).sort({ round: 1 });
    res.json({ ...college.toObject(), round_trends: rounds });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/josaa/branches
router.get('/branches', async (req, res) => {
  try {
    const branches = await JosaCollege.distinct('program_name');
    res.json(branches.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/josaa/institutes
router.get('/institutes', async (req, res) => {
  try {
    const institutes = await JosaCollege.distinct('institute');
    res.json(institutes.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
