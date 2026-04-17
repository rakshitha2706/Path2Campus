const express = require('express');
const router = express.Router();
const EapcetCollege = require('../models/EapcetCollege');
const JosaCollege = require('../models/JosaCollege');

// POST /api/chatbot
// Simple NLP-style filtering chatbot
router.post('/', async (req, res) => {
  try {
    const { message, exam = 'eapcet' } = req.body;
    const msg = message.toLowerCase();

    // Extract rank
    const rankMatch = msg.match(/rank[^\d]*(\d+)/);
    const rank = rankMatch ? parseInt(rankMatch[1]) : null;

    // Extract budget (only for eapcet)
    const budgetMatch = msg.match(/(\d+)\s*k?\s*(lakh|lac|l)?/);
    let budget = null;
    if (budgetMatch && exam === 'eapcet') {
      budget = budgetMatch[2] ? parseInt(budgetMatch[1]) * 100000 : parseInt(budgetMatch[1]) * 1000;
    }

    // Extract branch keywords
    const branchKeywords = {
      'cse': 'COMPUTER SCIENCE',
      'computer science': 'COMPUTER SCIENCE',
      'ece': 'ELECTRONICS AND COMMUNICATION',
      'electronics': 'ELECTRONICS AND COMMUNICATION',
      'mechanical': 'MECHANICAL',
      'civil': 'CIVIL',
      'eee': 'ELECTRICAL AND ELECTRONICS',
      'it': 'INFORMATION TECHNOLOGY',
      'ai': 'ARTIFICIAL INTELLIGENCE',
    };
    let branch = null;
    for (const [kw, branchName] of Object.entries(branchKeywords)) {
      if (msg.includes(kw)) { branch = branchName; break; }
    }

    // Extract category
    const categories = ['oc', 'bc_a', 'bc_b', 'bc_c', 'bc_d', 'bc_e', 'sc', 'st', 'ews'];
    let category = 'OC';
    for (const cat of categories) {
      if (msg.includes(cat)) { category = cat.toUpperCase(); break; }
    }

    // Response
    let response = '';
    let colleges = [];

    if (exam === 'eapcet') {
      const query = {};
      if (branch) query.branch_name = { $regex: branch, $options: 'i' };
      if (budget) query.tuition_fee = { $lte: budget };

      const all = await EapcetCollege.find(query).limit(200);
      const gKey = 'BOYS';
      const filtered = all.filter(c => {
        const key = category === 'EWS' ? 'EWS_GEN_OU' : `${category}_${gKey}`;
        const cr = c.cutoffs[key];
        if (!cr) return false;
        if (rank) return cr >= rank;
        return true;
      }).slice(0, 10);

      colleges = filtered.map(c => ({
        _id: c._id,
        institute_name: c.institute_name,
        branch_name: c.branch_name,
        place: c.place,
        tuition_fee: c.tuition_fee,
      }));

      if (rank) response = `Found ${colleges.length} EAPCET colleges you can get with rank ${rank}`;
      else if (budget) response = `Found ${colleges.length} EAPCET colleges under ₹${budget.toLocaleString()} fees`;
      else response = `Here are some EAPCET colleges matching your query`;
    } else {
      const query = {};
      if (branch) query.program_name = { $regex: branch, $options: 'i' };
      const all = await JosaCollege.find(query).limit(200);
      const filtered = all.filter(c => {
        if (!c.closing_rank) return false;
        if (rank) return c.closing_rank >= rank;
        return true;
      }).slice(0, 10);

      colleges = filtered.map(c => ({
        _id: c._id,
        institute: c.institute,
        program_name: c.program_name,
        closing_rank: c.closing_rank,
        institute_type: c.institute_type,
      }));

      if (rank) response = `Found ${colleges.length} JoSAA colleges you can get with rank ${rank}`;
      else response = `Here are some JoSAA colleges matching your query`;
    }

    res.json({ response, colleges, parsedQuery: { rank, branch, category, budget } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Chatbot error', error: err.message });
  }
});

module.exports = router;
