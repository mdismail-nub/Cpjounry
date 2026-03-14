import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = 'bg-primary' }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2 text-xs font-mono uppercase tracking-widest text-slate-400">
          <span>{label}</span>
          <span className="font-bold text-slate-600">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} transition-all duration-300`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
