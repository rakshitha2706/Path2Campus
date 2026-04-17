import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Target, Star, AlertCircle, ArrowLeft, GitCompare } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import { collegesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const tabs = [
  { id:'safe',   label:'Safe',   icon:Shield, color:'text-green-600', bg:'bg-green-50', border:'border-green-200' },
  { id:'target', label:'Target', icon:Target, color:'text-orange-600', bg:'bg-orange-50', border:'border-orange-200' },
  { id:'dream',  label:'Dream',  icon:Star,   color:'text-red-600', bg:'bg-red-50', border:'border-red-200' },
];

export default function Results() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState('safe');
  const [compareList, setCompareList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  if (!state?.results) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={40} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No results yet.</p>
        <button onClick={() => navigate('/search')} className="btn-primary mt-4 text-sm">
          Find Colleges
        </button>
      </div>
    );
  }

  const { results, exam, formData } = state;
  const current = results[activeTab] || [];

  const handleSave = async (college) => {
    if (!user) { toast('Please sign in to save colleges', {icon:'🔒'}); return; }
    try {
      if (savedIds.has(college._id)) {
        await collegesAPI.unsave(exam, college._id);
        setSavedIds(prev => { const s = new Set(prev); s.delete(college._id); return s; });
        toast.success('Removed from saved');
      } else {
        await collegesAPI.save(exam, college._id);
        setSavedIds(prev => new Set([...prev, college._id]));
        toast.success('Saved! ❤️');
      }
    } catch { toast.error('Action failed'); }
  };

  const handleCompare = (college) => {
    if (compareList.find(c => c._id === college._id)) {
      setCompareList(prev => prev.filter(c => c._id !== college._id));
    } else if (compareList.length >= 2) {
      toast('You can compare only 2 colleges at a time', {icon:'⚠️'});
    } else {
      setCompareList(prev => [...prev, college]);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/search')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors">
            <ArrowLeft size={15} /> Back to Search
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {exam === 'eapcet' ? '🏫 TG EAPCET' : '🏛️ JoSAA'} Recommendations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rank: <span className="font-semibold text-slate-700">{formData?.rank?.toLocaleString()}</span>
            {exam === 'eapcet' && formData?.category && <> · Category: <span className="font-semibold text-slate-700">{formData.category}</span></>}
            {exam === 'josaa' && formData?.quota && <> · Quota: <span className="font-semibold text-slate-700">{formData.quota}</span></>}
            · Total: <span className="font-semibold text-slate-700">{results.total}</span> matches
          </p>
        </div>
        {compareList.length >= 2 && (
          <button
            onClick={() => navigate('/compare', { state: { colleges: compareList, exam } })}
            className="btn-primary flex items-center gap-2"
          >
            <GitCompare size={16} /> Compare {compareList.length} Colleges
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => {
          const count = results[tab.id]?.length || 0;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                isActive
                  ? `${tab.bg} ${tab.color} ${tab.border}`
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? tab.bg : 'bg-slate-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compare strip */}
      {compareList.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5 flex-wrap">
          <GitCompare size={16} className="text-violet-600" />
          <span className="text-sm font-medium text-violet-700">Comparing:</span>
          {compareList.map(c => (
            <span key={c._id} className="bg-white border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">
              {exam === 'eapcet' ? c.institute_name?.slice(0,25) : c.institute?.slice(0,25)}…
              <button onClick={() => handleCompare(c)} className="ml-1.5 text-violet-400 hover:text-violet-700">✕</button>
            </span>
          ))}
          {compareList.length >= 2 && (
            <button
              onClick={() => navigate('/compare', { state: { colleges: compareList, exam } })}
              className="ml-auto btn-primary py-1.5 px-4 text-xs"
            >
              View Comparison
            </button>
          )}
        </div>
      )}

      {/* Cards grid */}
      {current.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-slate-500 font-medium">No {activeTab} colleges found.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or rank.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {current.map((col, i) => (
            <div key={col._id} style={{ animationDelay: `${i * 40}ms` }}>
              <CollegeCard
                college={col}
                exam={exam}
                isSaved={savedIds.has(col._id)}
                isCompared={!!compareList.find(c => c._id === col._id)}
                onSave={handleSave}
                onCompare={handleCompare}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
