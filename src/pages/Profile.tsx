import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import { UserProgress, Problem, Track } from '../types';
import { where } from 'firebase/firestore';
import { User as UserIcon, Award, Zap, Calendar, CheckCircle, Clock } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

const Profile: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [solvedProblems, setSolvedProblems] = useState<(Problem & { trackName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      const progress = await dbService.getCollection<UserProgress>('user_progress', [
        where('userId', '==', profile.uid),
        where('status', '==', 'solved')
      ]);

      if (progress.length > 0) {
        const problemIds = progress.map(p => p.problemId);
        const problems = await dbService.getCollection<Problem>('problems');
        const tracks = await dbService.getCollection<Track>('tracks');
        
        const solved = problems
          .filter(p => problemIds.includes(p.id))
          .map(p => ({
            ...p,
            trackName: tracks.find(t => t.id === p.track_id)?.name || 'Unknown Track'
          }));
        
        setSolvedProblems(solved);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center border-primary/20 bg-white shadow-xl"
          >
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full border-2 border-primary p-1">
                <img 
                  src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-lg shadow-lg">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile.displayName || 'Anonymous User'}</h2>
            <p className="text-slate-400 text-sm font-mono mb-6">{profile.email}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile.stats.totalSolved}</div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{profile.stats.currentStreak}</div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Streak</div>
              </div>
            </div>
          </motion.div>

          <div className="glass-card p-6 space-y-4 bg-white">
            <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">Achievements</h3>
            <div className="space-y-3">
              {[
                { icon: Zap, label: 'Fast Learner', desc: 'Solved 5 problems in a day', color: 'text-yellow-500' },
                { icon: CheckCircle, label: 'Track Master', desc: 'Completed first track', color: 'text-green-500' },
                { icon: Calendar, label: 'Consistent', desc: '7 days streak', color: 'text-primary' }
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ach.icon className={`w-5 h-5 ${ach.color}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{ach.label}</div>
                    <div className="text-[10px] text-slate-400">{ach.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">User Dashboard</h1>
              <p className="text-slate-500">Track your progress and solved problems.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border-primary/20 bg-white">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Total Solved</span>
              </div>
              <div className="text-4xl font-bold text-slate-800">{profile.stats.totalSolved}</div>
              <div className="mt-2 text-xs text-slate-400">Problems across all tracks</div>
            </div>
            
            <div className="glass-card p-6 border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-4 text-slate-600">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Current Streak</span>
              </div>
              <div className="text-4xl font-bold text-slate-800">{profile.stats.currentStreak}</div>
              <div className="mt-2 text-xs text-slate-400">Consecutive days active</div>
            </div>

            <div className="glass-card p-6 border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-4 text-slate-600">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Last Active</span>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {profile.stats.lastSolvedDate ? new Date(profile.stats.lastSolvedDate).toLocaleDateString() : 'N/A'}
              </div>
              <div className="mt-2 text-xs text-slate-400">Last solved problem date</div>
            </div>
          </div>

          <div className="glass-card overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Recently Solved Problems</h3>
              <span className="text-xs font-mono text-slate-400 uppercase">{solvedProblems.length} Total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {solvedProblems.length > 0 ? (
                solvedProblems.map((problem) => (
                  <div key={problem.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {problem.title}
                        </div>
                        <div className="text-xs text-slate-400 font-mono uppercase">
                          {problem.trackName} • {problem.platform}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={problem.problem_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View Problem
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 font-mono">
                  No problems solved yet. Start your journey!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
