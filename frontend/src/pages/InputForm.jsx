import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight, GraduationCap, Loader2 } from 'lucide-react';
import { eapcetAPI, josaaAPI } from '../api';
import toast from 'react-hot-toast';

const CATEGORIES  = ['OC','BC_A','BC_B','BC_C','BC_D','BC_E','SC','ST','EWS'];
const QUOTAS      = ['AI','HS','OS','JK','LA','GO'];
const INST_TYPES  = ['IIT','NIT','IIIT','GFTI'];
const EAPCET_BRANCHES = [
  'COMPUTER SCIENCE AND ENGINEERING',
  'ELECTRONICS AND COMMUNICATION ENGINEERING',
  'ELECTRICAL AND ELECTRONICS ENGINEERING',
  'MECHANICAL ENGINEERING',
  'CIVIL ENGINEERING',
  'INFORMATION TECHNOLOGY',
  'COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)',
  'DATA SCIENCE',
  'CHEMICAL ENGINEERING',
];
const JOSAA_BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Technology',
  'Engineering Physics',
  'Mathematics and Computing',
];

export default function InputForm() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const [exam, setExam] = useState(params.get('exam') || 'eapcet');
  const [loading, setLoading] = useState(false);

  // EAPCET form
  const [eForm, setEForm] = useState({
    rank:'', category:'OC', gender:'Male', branch:'', budget:'', place:''
  });
  // JoSAA form
  const [jForm, setJForm] = useState({
    rank:'', quota:'AI', gender:'Male', branch:'', institute_type:''
  });

  const handleEapcet = async (e) => {
    e.preventDefault();
    if (!eForm.rank) return toast.error('Please enter your rank');
    setLoading(true);
    try {
      const res = await eapcetAPI.recommend(eForm);
      navigate('/results', { state: { results: res.data, exam: 'eapcet', formData: eForm } });
    } catch {
      toast.error('Failed to fetch recommendations. Is the server running?');
    } finally { setLoading(false); }
  };

  const handleJosaa = async (e) => {
    e.preventDefault();
    if (!jForm.rank) return toast.error('Please enter your rank');
    setLoading(true);
    try {
      const res = await josaaAPI.recommend(jForm);
      navigate('/results', { state: { results: res.data, exam: 'josaa', formData: jForm } });
    } catch {
      toast.error('Failed to fetch recommendations. Is the server running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1.5 flex items-center gap-2">
          <Search size={22} className="text-blue-600" /> Find Your College
        </h1>
        <p className="text-sm text-slate-500">Enter your details to get personalised recommendations</p>
      </div>

      {/* Exam toggle */}
      <div className="card p-1.5 flex gap-1.5 mb-6">
        {[{id:'eapcet', label:'🏫 TG EAPCET 2024'},{id:'josaa', label:'🏛️ JEE · JoSAA 2024'}].map(ex => (
          <button
            key={ex.id}
            onClick={() => setExam(ex.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              exam === ex.id
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* EAPCET Form */}
      {exam === 'eapcet' && (
        <form onSubmit={handleEapcet} className="card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-blue-600" />
            <span className="font-semibold text-slate-700 text-sm">TG EAPCET Filters</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Your Rank *</label>
              <input type="number" min="1" placeholder="e.g. 25000" required
                value={eForm.rank} onChange={e => setEForm({...eForm, rank:e.target.value})}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select value={eForm.category} onChange={e => setEForm({...eForm, category:e.target.value})} className="form-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select value={eForm.gender} onChange={e => setEForm({...eForm, gender:e.target.value})} className="form-input">
                <option value="Male">Male (Boys)</option>
                <option value="Female">Female (Girls)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Branch (optional)</label>
              <select value={eForm.branch} onChange={e => setEForm({...eForm, branch:e.target.value})} className="form-input">
                <option value="">All Branches</option>
                {EAPCET_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Max Budget (₹)</label>
              <input type="number" min="0" step="5000" placeholder="e.g. 100000"
                value={eForm.budget} onChange={e => setEForm({...eForm, budget:e.target.value})}
                className="form-input" />
              <p className="text-[11px] text-slate-400 mt-1">Leave empty for all budgets</p>
            </div>
            <div>
              <label className="form-label">Location (optional)</label>
              <input type="text" placeholder="e.g. Hyderabad"
                value={eForm.place} onChange={e => setEForm({...eForm, place:e.target.value})}
                className="form-input" />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 border border-blue-100">
            💡 Safe = your rank is well within cutoff · Target = close to cutoff · Dream = above cutoff
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing...</>
                     : <><Search size={16}/> Get Recommendations <ArrowRight size={16}/></>}
          </button>
        </form>
      )}

      {/* JoSAA Form */}
      {exam === 'josaa' && (
        <form onSubmit={handleJosaa} className="card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-violet-600" />
            <span className="font-semibold text-slate-700 text-sm">JoSAA / JEE Filters</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">JEE Rank *</label>
              <input type="number" min="1" placeholder="e.g. 5000" required
                value={jForm.rank} onChange={e => setJForm({...jForm, rank:e.target.value})}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Quota</label>
              <select value={jForm.quota} onChange={e => setJForm({...jForm, quota:e.target.value})} className="form-input">
                {QUOTAS.map(q => <option key={q} value={q}>{q} – {q==='AI'?'All India':q==='HS'?'Home State':q==='OS'?'Other State':q}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select value={jForm.gender} onChange={e => setJForm({...jForm, gender:e.target.value})} className="form-input">
                <option value="Male">Male (Gender-Neutral)</option>
                <option value="Female">Female-only</option>
              </select>
            </div>
            <div>
              <label className="form-label">Branch (optional)</label>
              <select value={jForm.branch} onChange={e => setJForm({...jForm, branch:e.target.value})} className="form-input">
                <option value="">All Branches</option>
                {JOSAA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Preferred Institute Type (optional)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {INST_TYPES.map(t => (
                  <button key={t} type="button"
                    onClick={() => setJForm({...jForm, institute_type: jForm.institute_type===t ? '' : t})}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      jForm.institute_type===t
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-violet-50 rounded-xl p-4 text-xs text-violet-700 border border-violet-100">
            💡 Round 1 data · Seat Type = OPEN by default · Results show All India & Home State seats
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing...</>
                     : <><GraduationCap size={16}/> Get Recommendations <ArrowRight size={16}/></>}
          </button>
        </form>
      )}
    </div>
  );
}
