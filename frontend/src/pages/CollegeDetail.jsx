import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eapcetAPI, josaaAPI } from '../api';
import { MapPin, ArrowLeft, Loader2, IndianRupee, Shield, Building2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function CollegeDetail() {
  const { id, exam } = useParams();
  const navigate = useNavigate();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const api = exam === 'eapcet' ? eapcetAPI : josaaAPI;
        const response = await api.getCollege(id);
        setCollege(response.data);
      } catch (error) {
        toast.error('Failed to load college details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollege();
  }, [id, exam]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!college) {
    return <div className="p-12 text-center text-slate-500">College not found</div>;
  }

  const name = exam === 'eapcet' ? college.institute_name : college.institute;
  const branch = exam === 'eapcet' ? college.branch_name : college.program_name;
  const place = exam === 'eapcet' ? college.place : college.institute_type;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card p-6 border-t-4 border-t-blue-500">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{name}</h1>
            <p className="text-slate-600 font-medium mb-4">{branch}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {place}
              </span>
              {exam === 'josaa' && (
                <span className="flex items-center gap-1">
                  <Building2 size={16} /> {college.institute_type}
                </span>
              )}
              {exam === 'eapcet' && college.affiliated_to && (
                <span className="flex items-center gap-1">
                  <Shield size={16} /> {college.affiliated_to}
                </span>
              )}
            </div>
          </div>
          {exam === 'eapcet' && college.roi && (
            <div className="text-center bg-emerald-50 border border-emerald-100 rounded-xl p-3 min-w-[120px]">
              <div className="text-xs text-emerald-600 font-bold uppercase mb-1">Estimated ROI</div>
              <div className="text-2xl font-black text-emerald-700">{college.roi}x</div>
              <div className="text-[10px] text-emerald-600 mt-1">Return on Fees</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-blue-500" /> Key Information
          </h2>
          <div className="space-y-4">
            {exam === 'eapcet' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tuition Fee</div>
                  <div className="text-lg font-bold text-slate-800 flex items-center gap-1">
                    <IndianRupee size={16} /> {college.tuition_fee?.toLocaleString() || 'N/A'} / year
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">College Type</div>
                  <div className="text-sm font-medium text-slate-800">
                    {college.college_type} ({college.co_education})
                  </div>
                </div>
                {college.year_of_estab && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Established</div>
                    <div className="text-sm font-medium text-slate-800">{college.year_of_estab}</div>
                  </div>
                )}
              </>
            )}
            {exam === 'josaa' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Quota and Seat Type
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    <span className="font-bold text-blue-600">{college.quota}</span> - {college.seat_type}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender Focus</div>
                  <div className="text-sm font-medium text-slate-800">{college.gender}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Last Round Cutoff
                  </div>
                  <div className="text-lg font-bold text-slate-800">{college.closing_rank?.toLocaleString() || 'N/A'}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-500" />
            {exam === 'eapcet' ? 'Category Cutoffs' : 'Round Trends (Closing Rank)'}
          </h2>

          {exam === 'eapcet' && (
            <div className="max-h-[250px] overflow-y-auto pr-2">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 rounded-l-lg">Category</th>
                    <th className="px-3 py-2">Boys</th>
                    <th className="px-3 py-2 rounded-r-lg">Girls</th>
                  </tr>
                </thead>
                <tbody>
                  {['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'].map((category) => {
                    const boysKey = category === 'EWS' ? 'EWS_GEN_OU' : `${category}_BOYS`;
                    const girlsKey = category === 'EWS' ? 'EWS_GIRLS_OU' : `${category}_GIRLS`;
                    const boysValue = college.cutoffs?.[boysKey];
                    const girlsValue = college.cutoffs?.[girlsKey];

                    if (!boysValue && !girlsValue) return null;

                    return (
                      <tr key={category} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-700">{category}</td>
                        <td className="px-3 py-2">{boysValue?.toLocaleString() || '-'}</td>
                        <td className="px-3 py-2">{girlsValue?.toLocaleString() || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {exam === 'josaa' && college.round_trends && (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={college.round_trends} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="round"
                    tickFormatter={(value) => `R${value}`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis reversed domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelFormatter={(value) => `Round ${value}`}
                    formatter={(value) => [value.toLocaleString(), 'Closing Rank']}
                  />
                  <Line
                    type="monotone"
                    dataKey="closing_rank"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
