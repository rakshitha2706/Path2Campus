import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, MapPin, ChevronRight, ArrowLeft, Download, Share2, Sparkles } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, exam, formData } = location.state || {};

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Search size={48} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No data found</h2>
        <p className="text-slate-500 mb-6 text-center">Please go back and fill the recommendation form.</p>
        <button onClick={() => navigate('/search')} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const colleges = (results.colleges || [
    ...(results.safe || []),
    ...(results.target || []),
    ...(results.dream || []),
  ]).slice().sort((a, b) => {
    const rankA = Number(a?.closing_rank ?? Number.MAX_SAFE_INTEGER);
    const rankB = Number(b?.closing_rank ?? Number.MAX_SAFE_INTEGER);
    return rankA - rankB;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 font-semibold flex items-center gap-1 mb-4 hover:gap-2 transition-all"
          >
            <ArrowLeft size={16} /> Edit Filters
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            {exam === 'eapcet' ? 'TG EAPCET' : 'JoSAA'} Recommendations
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="badge bg-blue-50 text-blue-600 border-blue-100">Rank: {formData?.rank}</span>
            <span className="badge bg-violet-50 text-violet-600 border-violet-100">
              Category: {formData?.category || formData?.seat_type}
            </span>
            <span className="badge bg-slate-50 text-slate-500 border-slate-200">Total: {results.total} matches</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {colleges.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-5xl mb-4">:(</div>
            <p className="text-slate-600 font-bold text-lg">No eligible colleges found.</p>
            <p className="text-slate-400 text-sm mt-1">Try increasing your rank or changing branch preferences.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-1 gap-4">
            {colleges.map((college, index) => (
              <div
                key={college._id || index}
                onClick={() => navigate(`/${exam}/college/${college._id}`)}
                className="group relative bg-white border border-slate-100 p-5 rounded-2xl hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors flex-shrink-0">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-lg leading-tight mb-1">
                        {exam === 'eapcet' ? college.institute_name : college.institute}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Sparkles size={14} className="text-blue-400" /> {college.branch_name || college.program_name}
                        </span>
                        {college.place && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {college.place}
                          </span>
                        )}
                        {college.institute_type && (
                          <span className="badge bg-slate-100 text-slate-600 border-none px-2 py-0.5 text-[10px]">
                            {college.institute_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:border-l border-slate-50 md:pl-6">
                    <div className="text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Closing Rank</div>
                      <div className="text-xl font-black text-slate-900">{college.closing_rank}</div>
                    </div>
                    {exam === 'eapcet' && (
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Tuition Fee</div>
                        <div className="text-sm font-bold text-slate-700">
                          {college.tuition_fee ? `Rs ${(college.tuition_fee / 1000).toFixed(1)}K` : 'N/A'}
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Probability</div>
                      <div
                        className={`text-sm font-bold ${
                          college.admission_probability > 70
                            ? 'text-emerald-600'
                            : college.admission_probability > 40
                              ? 'text-orange-500'
                              : 'text-rose-500'
                        }`}
                      >
                        {college.admission_probability}%
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
