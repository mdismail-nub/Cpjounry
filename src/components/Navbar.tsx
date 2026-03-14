import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { Terminal, User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Terminal className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tighter text-slate-800">
              CP<span className="text-primary">JOURNEY</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-primary transition-colors font-medium">Tracks</Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1 font-medium">
                    <Settings className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link to="/profile" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-500 transition-colors flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary px-6 py-2 rounded-xl">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
