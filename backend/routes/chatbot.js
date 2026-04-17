const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const EapcetCollege = require('../models/EapcetCollege');
const JosaCollege = require('../models/JosaCollege');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_GROQ_MODELS = [
  process.env.GROQ_MODEL,
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
].filter(Boolean);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function createGroqCompletion(payload) {
  let lastError = null;

  for (const model of DEFAULT_GROQ_MODELS) {
    try {
      return await groq.chat.completions.create({
        ...payload,
        model,
      });
    } catch (error) {
      lastError = error;
      const isModelError =
        error?.status === 404 ||
        error?.error?.error?.code === 'model_not_found' ||
        error?.error?.code === 'model_not_found';

      if (!isModelError) throw error;
    }
  }

  throw lastError;
}

router.post('/', async (req, res) => {
  try {
    const { message, exam = 'eapcet' } = req.body;
    console.log('Chatbot received:', message, 'Exam context:', exam);

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(400).json({
        message: 'Groq API key not configured.',
      });
    }

    const analysisCompletion = await createGroqCompletion({
      messages: [
        {
          role: 'system',
          content: `You are an intelligent assistant for Path2Campus.
Extract parameters for college search. Always return a valid JSON object.

JSON Format:
{
  "intent": "search" | "general",
  "answer": "string (only if intent is general)",
  "params": {
    "rank": number | null,
    "category": string | null,
    "branch": string | null,
    "gender": "Male" | "Female" | "Gender-Neutral",
    "exam": "eapcet" | "josaa",
    "place": string | null,
    "district": string | null,
    "college_type": string | null,
    "institute_type": string | null
  }
}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = analysisCompletion.choices[0].message.content;
    const parsed = JSON.parse(content);
    const { intent, answer, params } = parsed;

    if (intent === 'general') {
      return res.json({ response: answer, colleges: [], parsedQuery: params });
    }

    const {
      rank,
      category,
      branch,
      gender,
      exam: detectedExam,
      place,
      district,
      college_type,
      institute_type,
    } = params;

    const finalExam = detectedExam || exam;
    const normalizedGender = gender === 'Female' ? 'Female' : 'Male';
    let colleges = [];

    if (finalExam === 'eapcet') {
      const query = {};
      if (branch?.trim()) query.branch_name = { $regex: `^${escapeRegex(branch.trim())}$`, $options: 'i' };
      if (place?.trim()) query.place = { $regex: `^${escapeRegex(place.trim())}$`, $options: 'i' };
      if (district?.trim()) query.dist_code = district.trim().toUpperCase();
      if (college_type?.trim()) query.college_type = { $regex: `^${escapeRegex(college_type.trim())}$`, $options: 'i' };

      const all = await EapcetCollege.find(query);
      const gKey = normalizedGender === 'Female' ? 'GIRLS' : 'BOYS';
      const cat = (category || 'OC').toUpperCase();

      const filtered = all.filter((college) => {
        const key =
          cat === 'EWS'
            ? normalizedGender === 'Female'
              ? 'EWS_GIRLS_OU'
              : 'EWS_GEN_OU'
            : `${cat}_${gKey}`;

        const cutoffRank = college.cutoffs[key];
        if (!cutoffRank) return false;
        if (rank) return cutoffRank >= rank;
        return true;
      });

      filtered.sort((a, b) => {
        const key =
          cat === 'EWS'
            ? normalizedGender === 'Female'
              ? 'EWS_GIRLS_OU'
              : 'EWS_GEN_OU'
            : `${cat}_${gKey}`;

        return a.cutoffs[key] - b.cutoffs[key];
      });

      colleges = filtered.slice(0, 10).map((college) => ({
        _id: college._id,
        institute_name: college.institute_name,
        branch_name: college.branch_name,
        place: college.place,
        tuition_fee: college.tuition_fee,
        cutoff:
          cat === 'EWS'
            ? normalizedGender === 'Female'
              ? college.cutoffs.EWS_GIRLS_OU
              : college.cutoffs.EWS_GEN_OU
            : college.cutoffs[`${cat}_${gKey}`],
      }));
    } else {
      const query = {
        gender: normalizedGender === 'Female' ? 'Female-only (including Supernumerary)' : 'Gender-Neutral',
      };

      if (branch?.trim()) query.program_name = { $regex: `^${escapeRegex(branch.trim())}$`, $options: 'i' };
      if (institute_type?.trim()) query.institute_type = { $regex: `^${escapeRegex(institute_type.trim())}$`, $options: 'i' };

      const cat = (category || 'OPEN').toUpperCase();
      query.seat_type =
        cat === 'OPEN'
          ? 'OPEN'
          : { $regex: `^${escapeRegex(cat)}(?:\\s*\\(.*\\))?$`, $options: 'i' };

      const all = await JosaCollege.find(query).sort({ closing_rank: 1 });
      const filtered = all.filter((college) => {
        if (!college.closing_rank) return false;
        if (rank) return college.closing_rank >= rank;
        return true;
      });

      colleges = filtered.slice(0, 10).map((college) => ({
        _id: college._id,
        institute: college.institute,
        program_name: college.program_name,
        closing_rank: college.closing_rank,
        institute_type: college.institute_type,
      }));
    }

    const summaryCompletion = await createGroqCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a friendly Path2Campus assistant. Summarize search results in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `User query: "${message}". Found ${colleges.length} colleges. Results: ${JSON.stringify(colleges.slice(0, 3))}`,
        },
      ],
    });

    res.json({
      response: summaryCompletion.choices[0].message.content,
      colleges,
      parsedQuery: { ...params, exam: finalExam },
    });
  } catch (err) {
    console.error('Groq Error:', err);
    res.status(500).json({
      message: 'Chatbot error',
      details: err?.error?.error?.message || err.message,
    });
  }
});

module.exports = router;
