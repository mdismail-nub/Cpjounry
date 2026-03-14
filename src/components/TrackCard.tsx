import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Track } from '../types';
import { ChevronRight, Layers } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface TrackCardProps {
  track: Track;
  progress?: number;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, progress = 0 }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col h-full group hover:border-primary/50 transition-all duration-300 bg-white"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Layers className="w-6 h-6" />
        </div>
        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Track #{track.order}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
        {track.name}
      </h3>
      <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2 leading-relaxed">
        {track.description}
      </p>
      
      <div className="space-y-4">
        <ProgressBar progress={progress} label="Progress" />
        <Link 
          to={`/track/${track.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 hover:bg-primary/10 text-slate-600 font-bold transition-all group-hover:text-primary border border-slate-100"
        >
          View Track <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TrackCard;
