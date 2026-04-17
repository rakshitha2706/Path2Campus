const express = require('express');
const router = express.Router();
const EapcetCollege = require('../models/EapcetCollege');
const { protect } = require('../middleware/auth');

const AVG_PACKAGE = 450000; // Static avg package ₹4.5 LPA

// Helper: get cutoff rank for a category+gender combo
function getCutoff(college, category, gender) {
  const gKey = gender === 'Female' ? 'GIRLS' : 'BOYS';
  // Special handling for EWS
  if (category === 'EWS') {
    return gender === 'Female'
      ? college.cutoffs.EWS_GIRLS_OU
      : college.cutoffs.EWS_GEN_OU;
  }
  const key = `${category}_${gKey}`;
  return college.cutoffs[key] || null;
}

// Helper: classify college
function classify(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return null;
  const ratio = (closingRank - userRank) / closingRank;
  if (ratio > 0.20) return 'safe';
  if (ratio >= -0.10) return 'target';
  return 'dream';
}

// Helper: admission probability
function probability(userRank, closingRank) {
  if (!closingRank || closingRank === 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((closingRank - userRank) / closingRank) * 100)));
}

// Helper: ROI
function calcROI(tuitionFee) {
  if (!tuitionFee || tuitionFee === 0) return null;
  return parseFloat((AVG_PACKAGE / tuitionFee).toFixed(2));
}

// Helper: fit score
function fitScore(college, userRank, closingRank, budget) {
  let score = 0;
  if (closingRank && userRank <= closingRank) score += 40;
  else score += Math.max(0, 40 - Math.round(((userRank - closingRank) / closingRank) * 40));
  if (budget && college.tuition_fee <= budget) score += 30;
  else if (budget) score += Math.max(0, 30 - Math.round(((college.tuition_fee - budget) / budget) * 30));
  else score += 20;
  // Established college bonus
  if (college.year_of_estab && college.year_of_estab < 2005) score += 20;
  else score += 10;
  return Math.min(100, score);
}

// POST /api/eapcet/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { rank, category = 'OC', gender = 'Male', branch, budget, place } = req.body;
    const userRank = parseInt(rank);
    if (!userRank) return res.status(400).json({ message: 'Rank is required' });

    const query = {};
    if (branch) query.branch_name = { $regex: branch, $options: 'i' };
    if (place) query.place = { $regex: place, $options: 'i' };
    if (budget) query.tuition_fee = { $lte: parseInt(budget) };

    const colleges = await EapcetCollege.find(query).limit(500);

    const results = [];
    for (const col of colleges) {
      const closingRank = getCutoff(col, category, gender);
      if (!closingRank) continue;
      const cat = classify(userRank, closingRank);
      if (!cat) continue;
      const prob = probability(userRank, closingRank);
      const roi = calcROI(col.tuition_fee);
      const fit = fitScore(col, userRank, closingRank, budget ? parseInt(budget) : null);
      results.push({
        _id: col._id,
        institute_name: col.institute_name,
        branch_name: col.branch_name,
        place: col.place,
        college_type: col.college_type,
        affiliated_to: col.affiliated_to,
        tuition_fee: col.tuition_fee,
        closing_rank: closingRank,
        category,
        gender,
        admission_probability: prob,
        fit_score: fit,
        roi,
        classification: cat,
        year_of_estab: col.year_of_estab,
      });
    }

    // Sort: safe by prob desc, target by prob desc, dream by prob desc
    const safe = results.filter(r => r.classification === 'safe').sort((a, b) => b.admission_probability - a.admission_probability).slice(0, 20);
    const target = results.filter(r => r.classification === 'target').sort((a, b) => b.admission_probability - a.admission_probability).slice(0, 20);
    const dream = results.filter(r => r.classification === 'dream').sort((a, b) => b.closing_rank - a.closing_rank).slice(0, 15);

    res.json({ safe, target, dream, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/eapcet/colleges
router.get('/colleges', async (req, res) => {
  try {
    const { branch, place, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (branch) query.branch_name = { $regex: branch, $options: 'i' };
    if (place) query.place = { $regex: place, $options: 'i' };
    if (type) query.college_type = { $regex: type, $options: 'i' };

    const total = await EapcetCollege.countDocuments(query);
    const colleges = await EapcetCollege.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ institute_name: 1 });

    res.json({ colleges, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/eapcet/colleges/:id
router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await EapcetCollege.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    const roi = calcROI(college.tuition_fee);
    res.json({ ...college.toObject(), roi });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/eapcet/branches
router.get('/branches', async (req, res) => {
  try {
    const branches = await EapcetCollege.distinct('branch_name');
    res.json(branches.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/eapcet/places
router.get('/places', async (req, res) => {
  try {
    const places = await EapcetCollege.distinct('place');
    res.json(places.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
