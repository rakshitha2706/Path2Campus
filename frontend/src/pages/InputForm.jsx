import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, GraduationCap, Loader2 } from 'lucide-react';
import { eapcetAPI, josaaAPI } from '../api';
import toast from 'react-hot-toast';

const QUOTAS = ['AI', 'HS', 'OS', 'JK', 'LA', 'GO'];
const INST_TYPES = ['IIT', 'NIT', 'IIIT', 'GFTI'];
const JOSAA_CATEGORIES = ['OPEN', 'EWS', 'OBC-NCL', 'SC', 'ST'];
const EAPCET_CATEGORIES = ['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'];

export default function InputForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(params.get('exam') || 'eapcet');
  const [loading, setLoading] = useState(false);

  const [eapcetBranches, setEapcetBranches] = useState([]);
  const [eapcetDistricts, setEapcetDistricts] = useState([]);
  const [josaaBranches, setJosaaBranches] = useState([]);

  const [eForm, setEForm] = useState({
    rank: '',
    category: 'OC',
    gender: 'Male',
    branch: '',
    budget: '',
    district: '',
    college_type: '',
  });

  const [jForm, setJForm] = useState({
    rank: '',
    quota: 'AI',
    gender: 'Male',
    branch: '',
    institute_type: '',
    category: 'OPEN',
  });

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [eBranches, eDistricts, jBranches] = await Promise.all([
          eapcetAPI.getBranches(),
          eapcetAPI.getDistricts(),
          josaaAPI.getBranches(),
        ]);

        setEapcetBranches(eBranches.data);
        setEapcetDistricts(eDistricts.data);
        setJosaaBranches(jBranches.data);
      } catch (error) {
        console.error('Failed to load filters', error);
      }
    };

    loadFilters();
  }, []);

  const handleEapcet = async (event) => {
    event.preventDefault();
    if (!eForm.rank) return toast.error('Please enter your rank');

    setLoading(true);
    try {
      const response = await eapcetAPI.recommend(eForm);
      navigate('/results', { state: { results: response.data, exam: 'eapcet', formData: eForm } });
    } catch {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleJosaa = async (event) => {
    event.preventDefault();
    if (!jForm.rank) return toast.error('Please enter your rank');

    setLoading(true);
    try {
      const response = await josaaAPI.recommend(jForm);
      navigate('/results', { state: { results: response.data, exam: 'josaa', formData: jForm } });
    } catch {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
          <Search size={28} className="text-blue-600" /> Find Your Best College
        </h1>
        <p className="text-slate-500">Based on 2024 cutoff data and AI-powered prediction</p>
      </div>

      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 mb-8 max-w-md">
        {[
          { id: 'eapcet', label: 'TG EAPCET' },
          { id: 'josaa', label: 'JEE / JoSAA' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setExam(item.id)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              exam === item.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {exam === 'eapcet' && (
        <form onSubmit={handleEapcet} className="card p-8 space-y-6 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="form-label text-blue-600 font-bold uppercase tracking-wider text-[11px]">
                Primary Information
              </label>
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="form-label">EAPCET Rank *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    required
                    value={eForm.rank}
                    onChange={(event) => setEForm({ ...eForm, rank: event.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={eForm.category}
                    onChange={(event) => setEForm({ ...eForm, category: event.target.value })}
                    className="form-input"
                  >
                    {EAPCET_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    value={eForm.gender}
                    onChange={(event) => setEForm({ ...eForm, gender: event.target.value })}
                    className="form-input"
                  >
                    <option value="Male">Male (Boys)</option>
                    <option value="Female">Female (Girls)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 pt-4 border-t border-slate-100">
              <label className="form-label text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Preferences and Filters
              </label>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="form-label">Branch Preference</label>
                  <select
                    value={eForm.branch}
                    onChange={(event) => setEForm({ ...eForm, branch: event.target.value })}
                    className="form-input"
                  >
                    <option value="">All Branches</option>
                    {eapcetBranches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">District</label>
                  <select
                    value={eForm.district}
                    onChange={(event) => setEForm({ ...eForm, district: event.target.value })}
                    className="form-input"
                  >
                    <option value="">All Districts</option>
                    {eapcetDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">College Type</label>
                  <select
                    value={eForm.college_type}
                    onChange={(event) => setEForm({ ...eForm, college_type: event.target.value })}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="PVT">Private (PVT)</option>
                    <option value="UNIV">University (UNIV)</option>
                    <option value="GOVT">Government (GOVT)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Max Tuition Fee (Rs) <span className="text-slate-400 text-xs">(Optional)</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={eForm.budget}
                    onChange={(event) => setEForm({ ...eForm, budget: event.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg mt-4 shadow-blue-500/20 shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Analysing Ranks...
              </>
            ) : (
              <>
                <Search size={20} /> Get Personalized Recommendations <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      )}

      {exam === 'josaa' && (
        <form onSubmit={handleJosaa} className="card p-8 space-y-6 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="form-label text-violet-600 font-bold uppercase tracking-wider text-[11px]">
                Candidate Details
              </label>
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="form-label">JEE Main/Adv Rank *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    required
                    value={jForm.rank}
                    onChange={(event) => setJForm({ ...jForm, rank: event.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Category (Seat Type)</label>
                  <select
                    value={jForm.category}
                    onChange={(event) => setJForm({ ...jForm, category: event.target.value })}
                    className="form-input"
                  >
                    {JOSAA_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    value={jForm.gender}
                    onChange={(event) => setJForm({ ...jForm, gender: event.target.value })}
                    className="form-input"
                  >
                    <option value="Male">Gender-Neutral</option>
                    <option value="Female">Female-only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 pt-4 border-t border-slate-100">
              <label className="form-label text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Institution Filters
              </label>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="form-label">Quota</label>
                  <select
                    value={jForm.quota}
                    onChange={(event) => setJForm({ ...jForm, quota: event.target.value })}
                    className="form-input"
                  >
                    {QUOTAS.map((quota) => (
                      <option key={quota} value={quota}>
                        {quota} - {quota === 'AI' ? 'All India' : quota === 'HS' ? 'Home State' : 'Other'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Program Preference</label>
                  <select
                    value={jForm.branch}
                    onChange={(event) => setJForm({ ...jForm, branch: event.target.value })}
                    className="form-input"
                  >
                    <option value="">All Programs</option>
                    {josaaBranches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Preferred Institute Type</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INST_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setJForm({ ...jForm, institute_type: jForm.institute_type === type ? '' : type })}
                        className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                          jForm.institute_type === type
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg mt-4 shadow-violet-500/20 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Fetching NITs and IITs...
              </>
            ) : (
              <>
                <GraduationCap size={20} /> See Admission Probability <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
