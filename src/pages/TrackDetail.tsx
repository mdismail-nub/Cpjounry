import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dbService } from '../services/db';
import { Track, Problem, UserProgress, ProgressStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import ProblemCard from '../components/ProblemCard';
import ProgressBar from '../components/ProgressBar';
import { ChevronLeft, Layout, Filter, Search } from 'lucide-react';
import { where, serverTimestamp } from 'firebase/firestore';

const TrackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const fetchedTrack = await dbService.getDocument<Track>('tracks', id);
      setTrack(fetchedTrack);

      const fetchedProblems = await dbService.getCollection<Problem>('problems', [
        where('track_id', '==', id)
      ]);
      setProblems(fetchedProblems.sort((a, b) => a.day_number - b.day_number));

      if (profile) {
        const progress = await dbService.getCollection<UserProgress>('user_progress', [
          where('userId', '==', profile.uid)
        ]);
        const progressMap: Record<string, UserProgress> = {};
        progress.forEach(p => {
          progressMap[p.problemId] = p;
        });
        setUserProgress(progressMap);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, profile]);

  const handleStatusChange = async (problemId: string, status: ProgressStatus) => {
    if (!profile) return;

    const progressId = `${profile.uid}__${problemId}`;
    const existing = userProgress[problemId];
    
    const newProgress: any = {
      userId: profile.uid,
      problemId,
      status,
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await dbService.updateDocument('user_progress', progressId, newProgress);
    } else {
      await dbService.setDocument('user_progress', progressId, newProgress);
    }

    setUserProgress(prev => ({
      ...prev,
      [problemId]: { ...newProgress, id: progressId }
    }));

    // Update user stats if solved
    if (status === 'solved' && (!existing || existing.status !== 'solved')) {
      const newTotal = (profile.stats.totalSolved || 0) + 1;
      await dbService.updateDocument('users', profile.uid, {
        'stats.totalSolved': newTotal,
        'stats.lastSolvedDate': new Date().toISOString()
      });
    }
  };

  const handleNotesChange = async (problemId: string, notes: string) => {
    if (!profile) return;

    const progressId = `${profile.uid}__${problemId}`;
    const existing = userProgress[problemId];
    
    const newProgress: any = {
      userId: profile.uid,
      problemId,
      status: existing?.status || 'not_started',
      notes,
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await dbService.updateDocument('user_progress', progressId, newProgress);
    } else {
      await dbService.setDocument('user_progress', progressId, newProgress);
    }

    setUserProgress(prev => ({
      ...prev,
      [problemId]: { ...newProgress, id: progressId }
    }));
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                         (filter === 'solved' && userProgress[p.id]?.status === 'solved') ||
                         (filter === 'unsolved' && userProgress[p.id]?.status !== 'solved');
    return matchesSearch && matchesFilter;
  });

  const solvedCount = problems.filter(p => userProgress[p.id]?.status === 'solved').length;
  const progressPercent = problems.length > 0 ? (solvedCount / problems.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Track Not Found</h2>
        <Link to="/" className="text-primary mt-4 inline-block">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tracks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <header>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Layout className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Track Details</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{track.name}</h1>
              <p className="text-slate-500 mb-8 leading-relaxed">{track.description}</p>
              
              <div className="glass-card p-6 border-primary/20 bg-white/80">
                <ProgressBar progress={progressPercent} label="Track Completion" />
                <div className="flex justify-between mt-4 text-sm font-mono">
                  <span className="text-slate-400">Solved</span>
                  <span className="text-slate-800 font-bold">{solvedCount} / {problems.length}</span>
                </div>
              </div>
            </header>

            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">Filters</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search problems or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors shadow-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'solved', 'unsolved'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      filter === f 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-primary/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            {filteredProblems.map((problem, index) => {
              const isLockedForGuest = !profile;
              
              // Unlocking criteria: Day 1 is always unlocked for logged in users.
              // Day N is unlocked if at least one problem from Day N-1 is solved.
              let meetsUnlockingCriteria = true;
              if (profile && problem.day_number > 1) {
                const previousDayProblems = problems.filter(p => p.day_number === problem.day_number - 1);
                meetsUnlockingCriteria = previousDayProblems.some(p => userProgress[p.id]?.status === 'solved');
              }

              const isLocked = problem.is_locked || isLockedForGuest || !meetsUnlockingCriteria;
              
              let lockMessage = "";
              if (isLocked) {
                if (problem.is_locked) lockMessage = "This problem is locked by the administrator.";
                else if (isLockedForGuest) lockMessage = "Login to unlock this challenge.";
                else if (!meetsUnlockingCriteria) lockMessage = "Solve at least one problem from the previous day to unlock.";
              }

              const effectiveProblem = { ...problem, is_locked: isLocked, lock_message: lockMessage };
              
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProblemCard 
                    problem={effectiveProblem} 
                    status={userProgress[problem.id]?.status || 'not_started'}
                    notes={userProgress[problem.id]?.notes}
                    onStatusChange={(status) => handleStatusChange(problem.id, status)}
                    onNotesChange={(notes) => handleNotesChange(problem.id, notes)}
                    disabled={isLocked}
                  />
                </motion.div>
              );
            })}
            
            {filteredProblems.length === 0 && (
              <div className="glass-card p-12 text-center border-dashed">
                <p className="text-slate-500 font-mono">No problems found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetail;
