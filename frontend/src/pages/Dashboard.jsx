import React, { useEffect, useState } from 'react';
import { eapcetAPI, josaaAPI } from '../api';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BarChart2, Loader2, IndianRupee, Layers } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [eData, setEData] = useState([]);
  const [jData, setJData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, jRes] = await Promise.all([
          eapcetAPI.getColleges({ limit: 100 }),
          josaaAPI.getColleges({ limit: 100 })
        ]);
        
        // Prepare EAPCET Fee vs ROI data
        const preppedEData = eRes.data.colleges
          .filter(c => c.tuition_fee)
          .map(c => ({
            name: c.institute_name,
            fee: c.tuition_fee,
            roi: parseFloat((450000 / c.tuition_fee).toFixed(2))
          }))
          .sort((a,b) => b.roi - a.roi)
          .slice(0, 30); // Top 30 ROI

        // Prepare JoSAA Opening vs Closing rank sample
        const preppedJData = jRes.data.colleges
          .filter(c => c.opening_rank && c.closing_rank)
          .map((c, i) => ({
            id: i,
            name: c.institute,
            opening: c.opening_rank,
            closing: c.closing_rank,
            type: c.institute_type
          }));

        setEData(preppedEData);
        setJData(preppedJData);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-1">
          <BarChart2 size={24} className="text-blue-600" /> Data Visualizations
        </h1>
        <p className="text-sm text-slate-500">Explore market trends across datasets</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* EAPCET ROI Chart */}
        <div className="card p-5">
           <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5"><IndianRupee size={16} className="text-emerald-500"/> EAPCET: Top 30 Colleges by Est. ROI</h3>
           <p className="text-xs text-slate-500 mb-6">Assuming ₹4.5 LPA average package</p>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={eData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                 <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                 <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize:'12px'}}
                   formatter={(val, name) => [name === 'roi' ? `${val}x` : `₹${val}`, name === 'roi' ? 'Est. ROI' : 'Tuition Fee']}
                   labelFormatter={(label) => <span className="font-bold text-slate-800 block mb-1">{label}</span>}
                 />
                 <Bar dataKey="roi" radius={[4,4,0,0]}>
                   {eData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index < 5 ? '#10b981' : '#94a3b8'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* JoSAA Rank Spread */}
        <div className="card p-5">
           <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5"><Layers size={16} className="text-violet-500"/> JoSAA: Opening vs Closing Rank Spread</h3>
           <p className="text-xs text-slate-500 mb-6">Sample of 100 recent cutoffs across IITs/NITs/IIITs</p>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                 <XAxis type="number" dataKey="opening" name="Opening Rank" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                 <YAxis type="number" dataKey="closing" name="Closing Rank" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                 <Tooltip 
                   cursor={{strokeDasharray: '3 3'}}
                   contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize:'12px'}}
                   formatter={(val) => val.toLocaleString()}
                   labelFormatter={() => ''}
                 />
                 <Scatter data={jData} fill="#8b5cf6" fillOpacity={0.6} shape="circle" />
               </ScatterChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
