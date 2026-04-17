const express = require('express');
const router = express.Router();
const EapcetCollege = require('../models/EapcetCollege');

const AVG_PACKAGE = 450000;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCutoff(college, category, gender) {
  const gKey = gender === 'Female' ? 'GIRLS' : 'BOYS';
  if (category === 'EWS') {
    return gender === 'Female' ? college.cutoffs.EWS_GIRLS_OU : college.cutoffs.EWS_GEN_OU;
  }
  return college.cutoffs[`${category}_${gKey}`] || null;
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

function calcROI(tuitionFee) {
  if (!tuitionFee || tuitionFee === 0) return null;
  return parseFloat((AVG_PACKAGE / tuitionFee).toFixed(2));
}

function fitScore(college, userRank, closingRank, budget) {
  let score = 0;
  if (closingRank && userRank <= closingRank) score += 40;
  else score += Math.max(0, 40 - Math.round(((userRank - closingRank) / closingRank) * 40));

  if (budget && college.tuition_fee <= budget) score += 30;
  else if (budget) score += Math.max(0, 30 - Math.round(((college.tuition_fee - budget) / budget) * 30));
  else score += 20;

  if (college.year_of_estab && college.year_of_estab < 2005) score += 20;
  else score += 10;

  return Math.min(100, score);
}

router.post('/recommend', async (req, res) => {
  try {
    const { rank, category = 'OC', gender = 'Male', branch, budget, place, district, college_type } = req.body;
    const userRank = parseInt(rank, 10);
    if (!userRank) return res.status(400).json({ message: 'Rank is required' });

    const parsedBudget = budget ? parseInt(budget, 10) : null;
    const query = {};

    if (branch?.trim()) query.branch_name = { $regex: `^${escapeRegex(branch.trim())}$`, $options: 'i' };
    if (place?.trim()) query.place = { $regex: `^${escapeRegex(place.trim())}$`, $options: 'i' };
    if (district?.trim()) query.dist_code = district.trim().toUpperCase();
    if (college_type?.trim()) query.college_type = { $regex: `^${escapeRegex(college_type.trim())}$`, $options: 'i' };
    if (parsedBudget) query.tuition_fee = { $lte: parsedBudget };

    const colleges = await EapcetCollege.find(query);
    const results = [];

    for (const college of colleges) {
      const closingRank = getCutoff(college, category, gender);
      if (!closingRank) continue;

      const classification = classify(userRank, closingRank);
      if (!classification) continue;

      results.push({
        _id: college._id,
        institute_name: college.institute_name,
        branch_name: college.branch_name,
        place: college.place,
        college_type: college.college_type,
        affiliated_to: college.affiliated_to,
        tuition_fee: college.tuition_fee,
        closing_rank: closingRank,
        category,
        gender,
        admission_probability: probability(userRank, closingRank),
        fit_score: fitScore(college, userRank, closingRank, parsedBudget),
        roi: calcROI(college.tuition_fee),
        classification,
        year_of_estab: college.year_of_estab,
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
    const { branch, place, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (branch) query.branch_name = { $regex: `^${escapeRegex(branch)}$`, $options: 'i' };
    if (place) query.place = { $regex: `^${escapeRegex(place)}$`, $options: 'i' };
    if (type) query.college_type = { $regex: `^${escapeRegex(type)}$`, $options: 'i' };

    const total = await EapcetCollege.countDocuments(query);
    const colleges = await EapcetCollege.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ institute_name: 1, branch_name: 1 });

    res.json({ colleges, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await EapcetCollege.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json({ ...college.toObject(), roi: calcROI(college.tuition_fee) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const branches = await EapcetCollege.distinct('branch_name');
    res.json(branches.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/places', async (req, res) => {
  try {
    const places = await EapcetCollege.distinct('place');
    res.json(places.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/districts', async (req, res) => {
  try {
    const districts = await EapcetCollege.distinct('dist_code');
    res.json(districts.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
