import React from 'react';
import { MapPin, TrendingUp, IndianRupee, Heart, GitCompare, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const classConfig = {
  safe: { label: 'Safe', cls: 'badge-safe', bar: 'bg-green-500' },
  target: { label: 'Target', cls: 'badge-target', bar: 'bg-orange-500' },
  dream: { label: 'Dream', cls: 'badge-dream', bar: 'bg-red-500' },
};

export default function CollegeCard({
  college,
  exam,
  onSave,
  onCompare,
  isSaved,
  isCompared,
}) {
  const navigate = useNavigate();
  const cfg = classConfig[college.classification] || classConfig.target;
  const prob = college.admission_probability ?? 0;
  const fit = college.fit_score ?? 0;

  const name = exam === 'eapcet' ? college.institute_name : college.institute;
  const branch = exam === 'eapcet' ? college.branch_name : college.program_name;
  const place = exam === 'eapcet' ? college.place || college.dist_code : college.institute_type;

  const openDetails = () => navigate(`/${exam}/college/${college._id}`);

  return (
    <div
      className="card p-5 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
      onClick={openDetails}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>
              {cfg.label}
            </span>
            {exam === 'josaa' && college.institute_type && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {college.institute_type}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{branch}</p>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onSave && onSave(college);
          }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSaved ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400'
          }`}
        >
          <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <MapPin size={12} />
        <span>{place || '-'}</span>
        {exam === 'josaa' && college.quota && (
          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
            Quota: {college.quota}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 font-medium mb-0.5">Closing Rank</div>
          <div className="font-bold text-slate-800 text-sm">
            {college.closing_rank?.toLocaleString() ?? '-'}
          </div>
        </div>
        {exam === 'eapcet' && (
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-[10px] text-slate-400 font-medium mb-0.5">Tuition Fee</div>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-0.5">
              <IndianRupee size={11} />
              {college.tuition_fee ? `${(college.tuition_fee / 1000).toFixed(0)}K` : '-'}
            </div>
          </div>
        )}
        {exam === 'josaa' && (
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-[10px] text-slate-400 font-medium mb-0.5">Opening Rank</div>
            <div className="font-bold text-slate-800 text-sm">
              {college.opening_rank?.toLocaleString() ?? '-'}
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp size={11} /> Admission Probability
          </span>
          <span className="text-[11px] font-bold text-slate-700">{prob}%</span>
        </div>
        <div className="prob-bar-track">
          <div className={`prob-bar-fill ${cfg.bar}`} style={{ width: `${prob}%` }} />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Star size={11} /> Fit Score
          </span>
          <span className="text-[11px] font-bold text-slate-700">{fit}%</span>
        </div>
        <div className="prob-bar-track">
          <div className="prob-bar-fill bg-violet-500" style={{ width: `${fit}%` }} />
        </div>
      </div>

      {exam === 'eapcet' && college.roi && (
        <div className="flex items-center gap-1.5 mb-4 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <IndianRupee size={12} /> ROI: {college.roi}x return on fees
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={(event) => {
            event.stopPropagation();
            openDetails();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye size={13} /> Details
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onCompare && onCompare(college);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            isCompared ? 'bg-violet-100 text-violet-700' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <GitCompare size={13} /> Compare
        </button>
      </div>
    </div>
  );
}
