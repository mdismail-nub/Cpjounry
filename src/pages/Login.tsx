import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { Terminal, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-md w-full border-primary/20 bg-white shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-primary/10 text-primary mb-4">
            <Terminal className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
            CP<span className="text-primary">JOURNEY</span>
          </h1>
          <p className="text-slate-500 mt-2">Initialize your competitive programming journey.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
            Secure Authentication Protocol v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
