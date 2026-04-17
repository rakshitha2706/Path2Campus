const express = require('express');
const router = express.Router();
const JosaCollege = require('../models/JosaCollege');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function classify(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return null;
  const ratio = (closingRank - userRank) / closingRank;
  if (ratio > 0.2) return 'safe';
  if (ratio >= -0.1) return 'target';
  return 'dream';
}

function probability(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((closingRank - userRank) / closingRank) * 100)));
}

function fitScore(college, userRank, closingRank) {
  let score = 0;
  if (closingRank && userRank <= closingRank) score += 50;
  else score += Math.max(0, 50 - Math.round(((userRank - closingRank) / closingRank) * 50));

  if (college.institute_type === 'IIT') score += 30;
  else if (college.institute_type === 'NIT') score += 20;
  else if (college.institute_type === 'IIIT') score += 15;
  else score += 10;

  return Math.min(100, score);
}

router.post('/recommend', async (req, res) => {
  try {
    const { rank, quota = 'AI', gender = 'Male', branch, institute_type, category = 'OPEN' } = req.body;
    const userRank = parseInt(rank, 10);
    if (!userRank) return res.status(400).json({ message: 'Rank is required' });

    const genderValue = gender === 'Female' ? 'Female-only (including Supernumerary)' : 'Gender-Neutral';
    const query = { quota, gender: genderValue };

    if (category?.trim()) {
      query.seat_type =
        category.toUpperCase() === 'OPEN'
          ? 'OPEN'
          : { $regex: `^${escapeRegex(category.trim())}(?:\\s*\\(.*\\))?$`, $options: 'i' };
    }
    if (branch?.trim()) query.program_name = { $regex: `^${escapeRegex(branch.trim())}$`, $options: 'i' };
    if (institute_type?.trim()) query.institute_type = { $regex: `^${escapeRegex(institute_type.trim())}$`, $options: 'i' };

    const colleges = await JosaCollege.find(query).sort({ closing_rank: 1 });
    const results = [];

    for (const college of colleges) {
      const closingRank = college.closing_rank;
      if (!closingRank) continue;

      const classification = classify(userRank, closingRank);
      if (!classification) continue;

      results.push({
        _id: college._id,
        institute: college.institute,
        program_name: college.program_name,
        quota: college.quota,
        seat_type: college.seat_type,
        gender: college.gender,
        opening_rank: college.opening_rank,
        closing_rank: closingRank,
        institute_type: college.institute_type,
        round: college.round,
        admission_probability: probability(userRank, closingRank),
        fit_score: fitScore(college, userRank, closingRank),
        classification,
      });
    }

    results.sort((a, b) => a.closing_rank - b.closing_rank);
    res.json({ colleges: results, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/colleges', async (req, res) => {
  try {
    const { branch, institute_type, quota, page = 1, limit = 20 } = req.query;
    const query = {};

    if (branch) query.program_name = { $regex: `^${escapeRegex(branch)}$`, $options: 'i' };
    if (institute_type) query.institute_type = { $regex: `^${escapeRegex(institute_type)}$`, $options: 'i' };
    if (quota) query.quota = quota;

    const total = await JosaCollege.countDocuments(query);
    const colleges = await JosaCollege.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ institute: 1, closing_rank: 1 });

    res.json({ colleges, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await JosaCollege.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

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

router.get('/branches', async (req, res) => {
  try {
    const branches = await JosaCollege.distinct('program_name');
    res.json(branches.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/institutes', async (req, res) => {
  try {
    const institutes = await JosaCollege.distinct('institute');
    res.json(institutes.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
