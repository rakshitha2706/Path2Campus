import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegesAPI } from '../api';
import CollegeCard from '../components/CollegeCard';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, AlertCircle, GitCompare } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearCompareState, getCompareState, toggleCompareCollege } from '../utils/compare';

export default function Saved() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState({ eapcet: [], josaa: [] });
  const [compareState, setCompareState] = useState(() => getCompareState());

  const fetchSaved = async () => {
    try {
      const res = await collegesAPI.getSaved();
      setSavedData(res.data);
    } catch {
      toast.error('Failed to load saved colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSaved();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUnsave = async (exam, collegeId) => {
    try {
      await collegesAPI.unsave(exam, collegeId);
      setSavedData((prev) => ({
        ...prev,
        [exam]: prev[exam].filter((college) => college._id !== collegeId),
      }));
      toast.success('Removed from saved');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleCompare = (exam, college) => {
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
    if (!compareState.exam || compareState.colleges.length < 2) {
      toast.error('Select 2 colleges to compare.');
      return;
    }

    navigate('/compare', {
      state: {
        exam: compareState.exam,
        colleges: compareState.colleges,
      },
    });
  };

  const resetCompare = () => {
    clearCompareState();
    setCompareState({ exam: null, colleges: [] });
    toast.success('Compare list cleared.');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Heart size={48} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in to save colleges</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
          Create an account to shortlist your dream colleges and access them from anywhere.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  const total = savedData.eapcet.length + savedData.josaa.length;
  const compareCount = compareState.colleges.length;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Heart size={24} className="text-red-500 fill-red-50" /> My Saved Colleges
          </h1>
          <p className="text-sm text-slate-500">You have shortlisted {total} colleges.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={openCompare} className="btn-primary text-sm gap-2">
            <GitCompare size={16} /> Open Compare ({compareCount}/2)
          </button>
          <button onClick={resetCompare} className="btn-secondary text-sm">
            Clear Compare
          </button>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <AlertCircle size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Your shortlist is empty.</p>
          <p className="text-xs text-slate-400 mt-1">Start browsing and click the heart icon to save.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {savedData.eapcet.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span> TG EAPCET
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedData.eapcet.map((college) => (
                  <CollegeCard
                    key={college._id}
                    college={college}
                    exam="eapcet"
                    isSaved={true}
                    isCompared={
                      compareState.exam === 'eapcet' &&
                      compareState.colleges.some((item) => item._id === college._id)
                    }
                    onSave={() => handleUnsave('eapcet', college._id)}
                    onCompare={() => handleCompare('eapcet', college)}
                  />
                ))}
              </div>
            </div>
          )}

          {savedData.josaa.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-violet-500 rounded-full"></span> JoSAA / JEE
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedData.josaa.map((college) => (
                  <CollegeCard
                    key={college._id}
                    college={college}
                    exam="josaa"
                    isSaved={true}
                    isCompared={
                      compareState.exam === 'josaa' &&
                      compareState.colleges.some((item) => item._id === college._id)
                    }
                    onSave={() => handleUnsave('josaa', college._id)}
                    onCompare={() => handleCompare('josaa', college)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
