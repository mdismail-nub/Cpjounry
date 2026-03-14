import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dbService } from '../services/db';
import { Track, UserProgress } from '../types';
import { useAuth } from '../hooks/useAuth';
import TrackCard from '../components/TrackCard';
import { Rocket, Trophy, Target } from 'lucide-react';
import { where } from 'firebase/firestore';

const Home: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedTracks = await dbService.getCollection<Track>('tracks');
      setTracks(fetchedTracks.sort((a, b) => a.order - b.order));

      if (profile) {
        const userProgress = await dbService.getCollection<UserProgress>('user_progress', [
          where('userId', '==', profile.uid),
          where('status', '==', 'solved')
        ]);

        const problems = await dbService.getCollection<{ id: string, track_id: string }>('problems');
        
        const trackProgress: Record<string, number> = {};
        fetchedTracks.forEach(track => {
          const trackProblems = problems.filter(p => p.track_id === track.id);
          if (trackProblems.length === 0) {
            trackProgress[track.id] = 0;
          } else {
            const solvedInTrack = userProgress.filter(up => 
              trackProblems.some(tp => tp.id === up.problemId)
            ).length;
            trackProgress[track.id] = (solvedInTrack / trackProblems.length) * 100;
          }
        });
        setProgress(trackProgress);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Mission Control</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tighter mb-4">
          Select Your <span className="text-primary">Learning Track</span>
        </h1>
        <p className="text-slate-500 max-w-2xl text-lg leading-relaxed">
          Structured paths curated by experts to take you from beginner to grandmaster. 
          Follow the steps, solve the problems, and master the algorithms.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <TrackCard track={track} progress={progress[track.id]} />
          </motion.div>
        ))}
        
        {tracks.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center border-dashed">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Tracks Available</h3>
            <p className="text-slate-500">The mission hasn't started yet. Check back later.</p>
          </div>
        )}
      </div>

      {profile && (
        <section className="mt-20">
          <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-primary/20 bg-white/80">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <Trophy className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Your Global Progress</h2>
                <p className="text-slate-500">You've solved {profile.stats.totalSolved} problems so far. Keep going!</p>
              </div>
            </div>
            <div className="w-full md:w-64">
              <div className="text-center mb-2">
                <span className="text-4xl font-bold text-slate-800">{profile.stats.totalSolved}</span>
                <span className="text-slate-400 ml-2 font-mono uppercase text-xs">Solved</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min(100, (profile.stats.totalSolved / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
