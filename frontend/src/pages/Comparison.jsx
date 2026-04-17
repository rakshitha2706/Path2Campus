import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, GitCompare } from 'lucide-react';
import { clearCompareState, getCompareState } from '../utils/compare';

export default function Comparison() {
  const location = useLocation();
  const navigate = useNavigate();

  const compareData = useMemo(() => {
    if (location.state?.colleges?.length) {
      return location.state;
    }

    return getCompareState();
  }, [location.state]);

  const colleges = compareData?.colleges || [];
  const exam = compareData?.exam;

  if (colleges.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={40} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Please select at least 2 colleges to compare.</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4 text-sm gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const [c1, c2] = colleges;

  const renderBetter = (val1, val2, lowerIsBetter = false) => {
    if (val1 == null || val2 == null || val1 === val2) {
      return null;
    }

    const isFirstBetter = lowerIsBetter ? val1 < val2 : val1 > val2;
    return isFirstBetter ? 0 : 1;
  };

  const betterMark = <CheckCircle2 size={16} className="text-green-500 inline-block ml-1" />;

  const comparisonRows = exam === 'eapcet'
    ? [
        { label: 'Institute Name', v1: c1.institute_name, v2: c2.institute_name },
        { label: 'Branch', v1: c1.branch_name, v2: c2.branch_name },
        { label: 'District', v1: c1.dist_code || '-', v2: c2.dist_code || '-' },
        { label: 'Place', v1: c1.place || '-', v2: c2.place || '-' },
        { label: 'College Type', v1: c1.college_type || '-', v2: c2.college_type || '-' },
        { label: 'Affiliated To', v1: c1.affiliated_to || '-', v2: c2.affiliated_to || '-' },
        {
          label: 'Closing Rank (Lower is tougher)',
          v1: c1.closing_rank?.toLocaleString() || '-',
          v2: c2.closing_rank?.toLocaleString() || '-',
          better: renderBetter(c1.closing_rank, c2.closing_rank, true),
        },
        {
          label: 'Your Admission Probability',
          v1: c1.admission_probability != null ? `${c1.admission_probability}%` : '-',
          v2: c2.admission_probability != null ? `${c2.admission_probability}%` : '-',
          better: renderBetter(c1.admission_probability, c2.admission_probability, false),
        },
        {
          label: 'Fit Score',
          v1: c1.fit_score != null ? `${c1.fit_score}%` : '-',
          v2: c2.fit_score != null ? `${c2.fit_score}%` : '-',
          better: renderBetter(c1.fit_score, c2.fit_score, false),
        },
        {
          label: 'Tuition Fee (Lower is better)',
          v1: c1.tuition_fee ? `Rs ${c1.tuition_fee.toLocaleString()}` : '-',
          v2: c2.tuition_fee ? `Rs ${c2.tuition_fee.toLocaleString()}` : '-',
          better: renderBetter(c1.tuition_fee, c2.tuition_fee, true),
        },
        {
          label: 'ROI (Higher is better)',
          v1: c1.roi ? `${c1.roi}x` : '-',
          v2: c2.roi ? `${c2.roi}x` : '-',
          better: renderBetter(c1.roi, c2.roi, false),
        },
      ]
    : [
        { label: 'Institute Name', v1: c1.institute, v2: c2.institute },
        { label: 'Program', v1: c1.program_name, v2: c2.program_name },
        { label: 'Institute Type', v1: c1.institute_type || '-', v2: c2.institute_type || '-' },
        { label: 'Quota', v1: c1.quota || '-', v2: c2.quota || '-' },
        { label: 'Seat Type', v1: c1.seat_type || '-', v2: c2.seat_type || '-' },
        { label: 'Gender', v1: c1.gender || '-', v2: c2.gender || '-' },
        {
          label: 'Closing Rank (Lower is tougher)',
          v1: c1.closing_rank?.toLocaleString() || '-',
          v2: c2.closing_rank?.toLocaleString() || '-',
          better: renderBetter(c1.closing_rank, c2.closing_rank, true),
        },
        {
          label: 'Your Admission Probability',
          v1: c1.admission_probability != null ? `${c1.admission_probability}%` : '-',
          v2: c2.admission_probability != null ? `${c2.admission_probability}%` : '-',
          better: renderBetter(c1.admission_probability, c2.admission_probability, false),
        },
        {
          label: 'Fit Score',
          v1: c1.fit_score != null ? `${c1.fit_score}%` : '-',
          v2: c2.fit_score != null ? `${c2.fit_score}%` : '-',
          better: renderBetter(c1.fit_score, c2.fit_score, false),
        },
      ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => {
            clearCompareState();
            navigate('/compare', { replace: true, state: { exam: null, colleges: [] } });
          }}
          className="btn-secondary text-sm"
        >
          Clear Compare
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
          <GitCompare size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Head-to-Head Comparison</h1>
          <p className="text-sm text-slate-500">Comparing 2 {exam === 'eapcet' ? 'EAPCET' : 'JoSAA'} options</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 divide-x divide-slate-100">
          <div className="p-4 font-semibold text-slate-500 flex items-center">Feature / Metric</div>
          <div className="p-4 text-center">
            <div className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">Option A</div>
            <div className="font-bold text-slate-800 line-clamp-2 leading-tight">
              {exam === 'eapcet' ? c1.institute_name : c1.institute}
            </div>
            <button
              onClick={() => navigate(`/${exam}/college/${c1._id}`)}
              className="text-xs text-blue-600 mt-2 hover:underline"
            >
              View Details
            </button>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-violet-600 font-bold mb-1 uppercase tracking-wider">Option B</div>
            <div className="font-bold text-slate-800 line-clamp-2 leading-tight">
              {exam === 'eapcet' ? c2.institute_name : c2.institute}
            </div>
            <button
              onClick={() => navigate(`/${exam}/college/${c2._id}`)}
              className="text-xs text-blue-600 mt-2 hover:underline"
            >
              View Details
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {comparisonRows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 divide-x divide-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="p-4 flex items-center text-sm font-medium text-slate-600">{row.label}</div>
              <div
                className={`p-4 flex items-center justify-center text-center text-sm ${
                  row.better === 0 ? 'bg-green-50/50 font-semibold text-green-800' : 'text-slate-800'
                }`}
              >
                {row.v1} {row.better === 0 && betterMark}
              </div>
              <div
                className={`p-4 flex items-center justify-center text-center text-sm ${
                  row.better === 1 ? 'bg-green-50/50 font-semibold text-green-800' : 'text-slate-800'
                }`}
              >
                {row.v2} {row.better === 1 && betterMark}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
