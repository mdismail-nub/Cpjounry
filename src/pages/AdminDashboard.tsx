import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbService } from '../services/db';
import { Track, Problem, Tag, Platform } from '../types';
import { Plus, Trash2, Edit2, Save, X, Layers, FileText, Tag as TagIcon, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'tracks' | 'problems' | 'tags'>('tracks');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [trackForm, setTrackForm] = useState({ name: '', description: '', order: 0 });
  const [problemForm, setProblemForm] = useState({
    title: '', platform: 'Codeforces' as Platform, problem_link: '', 
    difficulty: 'Easy', track_id: '', day_number: 1, is_locked: false, tags: [] as string[]
  });
  const [tagForm, setTagForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const [t, p, tg] = await Promise.all([
        dbService.getCollection<Track>('tracks'),
        dbService.getCollection<Problem>('problems'),
        dbService.getCollection<Tag>('tags')
      ]);
      setTracks(t.sort((a, b) => a.order - b.order));
      setProblems(p.sort((a, b) => a.day_number - b.day_number));
      setTags(tg);
      setLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" />;

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    await dbService.setDocument('tracks', id, trackForm);
    setTracks([...tracks, { ...trackForm, id }].sort((a, b) => a.order - b.order));
    setTrackForm({ name: '', description: '', order: tracks.length + 1 });
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    await dbService.setDocument('problems', id, problemForm);
    setProblems([...problems, { ...problemForm, id }].sort((a, b) => a.day_number - b.day_number));
    setProblemForm({
      title: '', platform: 'Codeforces', problem_link: '', 
      difficulty: 'Easy', track_id: '', day_number: 1, is_locked: false, tags: []
    });
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    await dbService.setDocument('tags', id, tagForm);
    setTags([...tags, { ...tagForm, id }]);
    setTagForm({ name: '' });
  };

  const handleDelete = async (collection: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    await dbService.deleteDocument(collection, id);
    if (collection === 'tracks') setTracks(tracks.filter(t => t.id !== id));
    if (collection === 'problems') setProblems(problems.filter(p => p.id !== id));
    if (collection === 'tags') setTags(tags.filter(t => t.id !== id));
  };

  const toggleLock = async (problem: Problem) => {
    const newStatus = !problem.is_locked;
    await dbService.updateDocument('problems', problem.id, { is_locked: newStatus });
    setProblems(problems.map(p => p.id === problem.id ? { ...p, is_locked: newStatus } : p));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tighter mb-2">Admin <span className="text-primary">Dashboard</span></h1>
        <p className="text-slate-500">Manage tracks, problems, and system configurations.</p>
      </header>

      <div className="flex gap-4 mb-8">
        {[
          { id: 'tracks', label: 'Tracks', icon: Layers },
          { id: 'problems', label: 'Problems', icon: FileText },
          { id: 'tags', label: 'Tags', icon: TagIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-slate-500 hover:text-primary border border-slate-200'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
        <button
          onClick={async () => {
            if (window.confirm('Seed example data?')) {
              await dbService.seedData();
              window.location.reload();
            }
          }}
          className="ml-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary transition-all text-xs font-mono uppercase"
        >
          Seed Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24 bg-white">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New {activeTab.slice(0, -1)}
            </h3>

            {activeTab === 'tracks' && (
              <form onSubmit={handleCreateTrack} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Track Name</label>
                  <input 
                    type="text" required
                    value={trackForm.name}
                    onChange={e => setTrackForm({...trackForm, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Description</label>
                  <textarea 
                    required
                    value={trackForm.description}
                    onChange={e => setTrackForm({...trackForm, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none h-24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Order</label>
                  <input 
                    type="number" required
                    value={trackForm.order}
                    onChange={e => setTrackForm({...trackForm, order: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <button type="submit" className="w-full btn-primary">Create Track</button>
              </form>
            )}

            {activeTab === 'problems' && (
              <form onSubmit={handleCreateProblem} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Title</label>
                  <input 
                    type="text" required
                    value={problemForm.title}
                    onChange={e => setProblemForm({...problemForm, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Platform</label>
                    <select 
                      value={problemForm.platform}
                      onChange={e => setProblemForm({...problemForm, platform: e.target.value as Platform})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    >
                      <option value="Codeforces">Codeforces</option>
                      <option value="CodeChef">CodeChef</option>
                      <option value="Beecrowd">Beecrowd</option>
                      <option value="AtCoder">AtCoder</option>
                      <option value="Toph">Toph</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Difficulty</label>
                    <input 
                      type="text" required
                      value={problemForm.difficulty}
                      onChange={e => setProblemForm({...problemForm, difficulty: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Problem Link</label>
                  <input 
                    type="url" required
                    value={problemForm.problem_link}
                    onChange={e => setProblemForm({...problemForm, problem_link: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Track</label>
                  <select 
                    required
                    value={problemForm.track_id}
                    onChange={e => setProblemForm({...problemForm, track_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select Track</option>
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Day Number</label>
                    <input 
                      type="number" required
                      value={problemForm.day_number}
                      onChange={e => setProblemForm({...problemForm, day_number: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input 
                      type="checkbox"
                      checked={problemForm.is_locked}
                      onChange={e => setProblemForm({...problemForm, is_locked: e.target.checked})}
                      className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-primary"
                    />
                    <label className="text-xs font-mono text-slate-400 uppercase">Locked</label>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary">Create Problem</button>
              </form>
            )}

            {activeTab === 'tags' && (
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Tag Name</label>
                  <input 
                    type="text" required
                    value={tagForm.name}
                    onChange={e => setTagForm({...tagForm, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:border-primary outline-none"
                  />
                </div>
                <button type="submit" className="w-full btn-primary">Create Tag</button>
              </form>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-mono uppercase text-slate-400">Details</th>
                  <th className="p-4 text-xs font-mono uppercase text-slate-400">Status</th>
                  <th className="p-4 text-xs font-mono uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'tracks' && tracks.map(track => (
                  <tr key={track.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{track.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{track.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-primary font-bold">Order: {track.order}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleDelete('tracks', track.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {activeTab === 'problems' && problems.map(problem => (
                  <tr key={problem.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{problem.title}</div>
                      <div className="text-xs text-slate-500">
                        {problem.platform} • Day {problem.day_number}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleLock(problem)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                          problem.is_locked ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                        }`}
                      >
                        {problem.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {problem.is_locked ? 'Locked' : 'Unlocked'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleDelete('problems', problem.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {activeTab === 'tags' && tags.map(tag => (
                  <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{tag.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-slate-400">ID: {tag.id}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleDelete('tags', tag.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
