import React from 'react';
import { motion } from 'framer-motion';
import { Problem, ProgressStatus } from '../types';
import { ExternalLink, CheckCircle2, Circle, Lock, AlertCircle, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import TagBadge from './TagBadge';

interface ProblemCardProps {
  problem: Problem;
  status: ProgressStatus;
  notes?: string;
  onStatusChange: (status: ProgressStatus) => void;
  onNotesChange: (notes: string) => void;
  disabled?: boolean;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, status, notes = '', onStatusChange, onNotesChange, disabled }) => {
  const isSolved = status === 'solved';
  const isAttempted = status === 'attempted';
  const [showNotes, setShowNotes] = React.useState(false);
  const [localNotes, setLocalNotes] = React.useState(notes);

  React.useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleNotesBlur = () => {
    if (localNotes !== notes) {
      onNotesChange(localNotes);
    }
  };

  const statusColors = {
    solved: 'border-l-solved bg-solved/5',
    attempted: 'border-l-attempted bg-attempted/5',
    not_started: 'border-l-slate-300 bg-white'
  };

  return (
    <motion.div 
      layout
      className={`glass-card p-6 border-l-8 transition-all duration-300 ${
        problem.is_locked ? 'opacity-70 grayscale bg-slate-50' : statusColors[status]
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Day {problem.day_number} • {problem.platform}
            </span>
            {problem.is_locked && <Lock className="w-3 h-3 text-slate-400" />}
          </div>
          
          <h4 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            {problem.title}
            {isSolved && <CheckCircle2 className="w-5 h-5 text-solved" />}
            {isAttempted && <AlertCircle className="w-5 h-5 text-attempted" />}
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {problem.tags.map(tag => (
              <TagBadge key={tag} name={tag} />
            ))}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a 
            href={problem.problem_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm ${
              problem.is_locked ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-slate-100 gap-4">
        <div className="flex gap-2">
          <button
            disabled={problem.is_locked || disabled}
            onClick={() => onStatusChange('solved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isSolved 
                ? 'bg-solved text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-solved/20 hover:text-solved'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Solved
          </button>
          <button
            disabled={problem.is_locked || disabled}
            onClick={() => onStatusChange('attempted')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isAttempted 
                ? 'bg-attempted text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-attempted/20 hover:text-attempted'
            }`}
          >
            <AlertCircle className="w-4 h-4" /> Attempted
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {!problem.is_locked && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                notes 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              {showNotes ? 'Hide Notes' : notes ? 'Edit Notes' : 'Add Note'}
            </button>
          )}
          
          {problem.is_locked ? (
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : (
            <span className={`text-[10px] font-mono uppercase font-bold ${
              isSolved ? 'text-solved' : isAttempted ? 'text-attempted' : 'text-slate-400'
            }`}>
              {status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {problem.is_locked && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-500 italic">
          <Lock className="w-3 h-3" />
          {problem.lock_message || "This problem is currently locked."}
        </div>
      )}

      {showNotes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-slate-100"
        >
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Write your notes here (e.g., approach, key insights, or why you got stuck)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y shadow-inner"
            disabled={disabled}
          />
          <div className="mt-2 text-[10px] font-mono text-slate-400 text-right italic">
            Changes are saved automatically when you click away
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProblemCard;
