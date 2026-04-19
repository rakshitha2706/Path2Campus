import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, Download, Share2, GitCompare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CollegeCard from '../components/CollegeCard';
import { collegesAPI, eapcetAPI, josaaAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { getCompareState, toggleCompareCollege } from '../utils/compare';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [sharedPayload, setSharedPayload] = React.useState(null);
  const [sharedLoading, setSharedLoading] = React.useState(false);
  const { results: stateResults, exam: stateExam, formData: stateFormData } = location.state || {};
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [compareState, setCompareState] = useState(() => getCompareState());

  React.useEffect(() => {
    const shared = searchParams.get('share');

    if (!shared) {
      setSharedPayload(null);
      setSharedLoading(false);
      return;
    }

    let cancelled = false;

    const loadSharedResults = async () => {
      setSharedLoading(true);

      try {
        const decoded = JSON.parse(decodeURIComponent(shared));
        const sharedExam = decoded?.exam;
        const sharedFormData = decoded?.formData;
        const api = sharedExam === 'eapcet' ? eapcetAPI : josaaAPI;

        if (!sharedExam || !sharedFormData || !api) {
          throw new Error('Invalid shared results link');
        }

        const response = await api.recommend(sharedFormData);

        if (!cancelled) {
          setSharedPayload({
            results: response.data,
            exam: sharedExam,
            formData: sharedFormData,
          });
        }
      } catch {
        if (!cancelled) {
          setSharedPayload(null);
          toast.error('This shared results link is invalid or expired.');
        }
      } finally {
        if (!cancelled) {
          setSharedLoading(false);
        }
      }
    };

    loadSharedResults();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const results = stateResults || sharedPayload?.results;
  const exam = stateExam || sharedPayload?.exam;
  const formData = stateFormData || sharedPayload?.formData;

  const colleges = useMemo(() => {
    if (!results) {
      return [];
    }

    return (results.colleges || [
      ...(results.safe || []),
      ...(results.target || []),
      ...(results.dream || []),
    ])
      .slice()
      .sort((a, b) => {
        const rankA = Number(a?.closing_rank ?? Number.MAX_SAFE_INTEGER);
        const rankB = Number(b?.closing_rank ?? Number.MAX_SAFE_INTEGER);
        return rankA - rankB;
      });
  }, [results]);

  React.useEffect(() => {
    if (stateResults || !results || !exam || !formData) {
      return;
    }

    navigate('/results', {
      replace: true,
      state: { results, exam, formData },
    });
  }, [exam, formData, navigate, results, stateResults]);

  React.useEffect(() => {
    let ignore = false;

    const loadSaved = async () => {
      if (!user) {
        setSavedIds(new Set());
        return;
      }

      try {
        const response = await collegesAPI.getSaved();
        const ids = new Set((response.data?.[exam] || []).map((college) => college._id));
        if (!ignore) {
          setSavedIds(ids);
        }
      } catch {
        if (!ignore) {
          setSavedIds(new Set());
        }
      }
    };

    loadSaved();
    return () => {
      ignore = true;
    };
  }, [exam, user]);

  if (sharedLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Opening shared results</h2>
        <p className="text-slate-500 mt-2 text-center">We are rebuilding these recommendations from the shared filters.</p>
      </div>
    );
  }

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

  const activeCompare = compareState.exam === exam ? compareState.colleges : [];

  const handleSave = async (college) => {
    if (!user) {
      toast.error('Please sign in to save colleges.');
      navigate('/login');
      return;
    }

    const isSaved = savedIds.has(college._id);

    try {
      if (isSaved) {
        await collegesAPI.unsave(exam, college._id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(college._id);
          return next;
        });
        toast.success('Removed from saved colleges.');
      } else {
        await collegesAPI.save(exam, college._id);
        setSavedIds((prev) => new Set([...prev, college._id]));
        toast.success('College saved.');
      }
    } catch {
      toast.error('Could not update saved colleges.');
    }
  };

  const handleCompare = (college) => {
    const nextState = toggleCompareCollege(exam, college);
    setCompareState(nextState);

    if (nextState.exam !== exam) {
      toast.error('Please compare colleges from the same exam.');
      return;
    }

    if (nextState.colleges.some((item) => item._id === college._id)) {
      toast.success(`Compare list: ${nextState.colleges.length}/2`);
    } else {
      toast.success('Removed from compare list.');
    }
  };

  const openCompare = () => {
    if (activeCompare.length < 2) {
      toast.error('Select 2 colleges to compare.');
      return;
    }

    navigate('/compare', {
      state: {
        exam,
        colleges: activeCompare,
      },
    });
  };

  const handleExport = () => {
    const rows = colleges.map((college) => ({
      institute: exam === 'eapcet' ? college.institute_name : college.institute,
      branch: exam === 'eapcet' ? college.branch_name : college.program_name,
      closing_rank: college.closing_rank ?? '',
      district: college.dist_code ?? '',
      place: college.place ?? '',
      type: college.college_type || college.institute_type || '',
      probability: college.admission_probability ?? '',
      fit_score: college.fit_score ?? '',
    }));

    const header = Object.keys(rows[0] || {
      institute: '',
      branch: '',
      closing_rank: '',
      district: '',
      place: '',
      type: '',
      probability: '',
      fit_score: '',
    });

    const csv = [
      header.join(','),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exam}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported.');
  };

  const handleShare = async () => {
    const shareText = `Path2Campus ${exam === 'eapcet' ? 'TG EAPCET' : 'JoSAA'} results for rank ${formData?.rank}`;
    const sharedUrl = `${window.location.origin}/?share=${encodeURIComponent(
      JSON.stringify({
        exam,
        formData,
      })
    )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Path2Campus Results',
          text: shareText,
          url: sharedUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${sharedUrl}`);
        toast.success('Results link copied to clipboard.');
      }
    } catch {
      toast.error('Could not share results right now.');
    }
  };

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
          <h1 className="text-3xl font-extrabold text-slate-900">
            {exam === 'eapcet' ? 'TG EAPCET' : 'JoSAA'} Recommendations
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="badge bg-blue-50 text-blue-600 border-blue-100">Rank: {formData?.rank}</span>
            <span className="badge bg-violet-50 text-violet-600 border-violet-100">
              Category: {formData?.category || formData?.seat_type}
            </span>
            {exam === 'eapcet' && formData?.district && (
              <span className="badge bg-emerald-50 text-emerald-700 border-emerald-100">
                District: {formData.district}
              </span>
            )}
            <span className="badge bg-slate-50 text-slate-500 border-slate-200">
              Total: {results.total ?? colleges.length} matches
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openCompare}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
          >
            <GitCompare size={16} /> Compare ({activeCompare.length}/2)
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {colleges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-5xl mb-4">:(</div>
          <p className="text-slate-600 font-bold text-lg">No eligible colleges found.</p>
          <p className="text-slate-400 text-sm mt-1">Try changing the filters and search again.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {colleges.map((college) => (
            <CollegeCard
              key={college._id}
              college={college}
              exam={exam}
              onSave={handleSave}
              onCompare={handleCompare}
              isSaved={savedIds.has(college._id)}
              isCompared={activeCompare.some((item) => item._id === college._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
