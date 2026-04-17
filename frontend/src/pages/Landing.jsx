import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Sparkles, Target, TrendingUp, Users, Star, CheckCircle, ChevronRight } from 'lucide-react';

const stats = [
  { value: '963+', label: 'EAPCET Colleges' },
  { value: '11,719', label: 'JoSAA Records' },
  { value: '48', label: 'IITs/NITs/IIITs' },
  { value: '99%', label: 'Data Accuracy' },
];

const features = [
  {
    icon: Sparkles, color: 'bg-blue-50 text-blue-600',
    title: 'AI-Powered Recommendations',
    desc: 'Smart algorithms classify colleges as Safe, Target, or Dream based on your rank.'
  },
  {
    icon: Target, color: 'bg-violet-50 text-violet-600',
    title: 'Admission Probability',
    desc: 'Know your exact admission chances before applying to any college.'
  },
  {
    icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600',
    title: 'ROI Calculator',
    desc: 'Calculate return on investment based on tuition fees and average packages (EAPCET).'
  },
  {
    icon: GitCompare2, color: 'bg-orange-50 text-orange-600',
    title: 'Side-by-Side Comparison',
    desc: 'Compare 2 colleges across all metrics to make the best decision.'
  },
];

function GitCompare2({ className, size }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
      <path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>
      <polyline points="15 9 18 6 21 9"/><polyline points="9 15 6 18 3 15"/>
    </svg>
  );
}

const examCards = [
  {
    id: 'eapcet',
    title: 'TG EAPCET 2024',
    subtitle: 'Telangana Engineering',
    desc: 'Category-wise cutoffs, tuition fees, ROI analysis for 963+ Telangana colleges',
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    features: ['Category-wise ranks (OC, BC, SC, ST, EWS)', 'Tuition fee & ROI calculation', 'Location-based filtering'],
  },
  {
    id: 'josaa',
    title: 'JoSAA 2024',
    subtitle: 'IITs · NITs · IIITs',
    desc: 'Multi-round cutoff data for 48 premier institutes including IITs, NITs & IIITs',
    gradient: 'from-violet-500 to-violet-700',
    lightBg: 'bg-violet-50',
    features: ['Round-wise cutoff trends', '11,000+ program records', 'Quota-based filtering'],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar-lite for landing */}
      <header className="flex items-center justify-between px-6 lg:px-16 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">Path2Campus</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-secondary py-2 text-sm">Sign In</button>
          <button onClick={() => navigate('/search')} className="btn-primary py-2 text-sm">Get Started</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-bg px-6 lg:px-16 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-in">
          <Sparkles size={12} /> AI-Powered · Data-Driven · 2024 Dataset
        </div>
        <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-5 leading-tight animate-fade-in delay-100">
          Find Your <span className="gradient-text">Perfect College</span><br />with AI Precision
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 animate-fade-in delay-200">
          Enter your rank and get personalized Safe, Target & Dream college recommendations
          powered by real 2024 TG EAPCET and JoSAA data.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
          <button onClick={() => navigate('/search')} className="btn-primary gap-2 flex items-center text-base px-8 py-3.5 animate-pulse-glow">
            Find Your College <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
            View Analytics
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto animate-fade-in delay-400">
          {stats.map(s => (
            <div key={s.label} className="stat-card text-center">
              <div className="text-2xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Exam selector */}
      <section className="px-6 lg:px-16 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">Choose Your Exam</h2>
          <p className="text-slate-500 text-sm">Select the exam you appeared for to get accurate recommendations</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {examCards.map((exam, i) => (
            <button
              key={exam.id}
              onClick={() => navigate(`/search?exam=${exam.id}`)}
              className={`card p-6 text-left group cursor-pointer animate-fade-in delay-${i * 100 + 100}`}
            >
              <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${exam.gradient} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4`}>
                <GraduationCap size={13} /> {exam.subtitle}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{exam.title}</h3>
              <p className="text-sm text-slate-500 mb-5">{exam.desc}</p>
              <ul className="space-y-2 mb-5">
                {exam.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className={`flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all`}>
                Get Recommendations <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-6 lg:px-16 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">Everything You Need to Decide</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Not just a college list — a complete decision-making platform</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={f.title} className={`card p-5 animate-fade-in delay-${i * 100}`}>
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">Ready to Find Your College?</h2>
          <p className="text-blue-100 text-sm mb-6">Join thousands of students making data-driven admission decisions</p>
          <button onClick={() => navigate('/search')} className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 mx-auto">
            Start for Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 lg:px-16 py-6 text-center text-xs text-slate-400">
        © 2024 Path2Campus · Data sourced from TG EAPCET 2024 & JoSAA 2024 official datasets
      </footer>
    </div>
  );
}
