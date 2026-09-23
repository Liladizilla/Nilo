import React from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Bot,
  User as UserIcon,
  LogOut,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Database,
  ExternalLink
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onOpenTargetProfile: () => void;
  onOpenAISettings: () => void;
  onRunIngestion: () => void;
  isIngesting: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenTargetProfile,
  onOpenAISettings,
  onRunIngestion,
  isIngesting,
  searchQuery,
  setSearchQuery,
}) => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'opportunities', label: 'Opportunities', icon: Sparkles, badge: 'Active' },
    { id: 'signals', label: 'Signals', icon: Database },
    { id: 'entities', label: 'Entities', icon: UserIcon },
    { id: 'discovery', label: 'Search Grounding', icon: Search, badge: 'Live' },
    { id: 'outcomes', label: 'Outcome Loop', icon: ShieldCheck },
    { id: 'sources', label: 'Sources', icon: RefreshCw },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0c121e]/95 backdrop-blur sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-700/80 flex items-center justify-center text-teal-400 font-mono font-semibold text-sm">
              NL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white text-sm font-sans">NILO</span>
                <span className="text-[11px] font-mono text-teal-400/90 tracking-wider">
                  OPPORTUNITY INTELLIGENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Public Signal Correlation & Hypotheses</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'opportunities' && activeTab !== 'overview' && activeTab !== 'discovery') {
                    setActiveTab('opportunities');
                  }
                }}
                placeholder="Search entities, signals, evidence or opportunities..."
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Actions & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRunIngestion}
              disabled={isIngesting}
              title="Trigger permitted source ingestion crawl"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isIngesting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{isIngesting ? 'Ingesting...' : 'Ingest Sources'}</span>
            </button>

            <button
              onClick={onOpenTargetProfile}
              title="Configure Target Provider Profile"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Target Profile</span>
            </button>

            <button
              onClick={onOpenAISettings}
              title="AI Cognitive Model & Thinking Controls"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">AI Stack</span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-1.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-slate-700" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-slate-300 hidden xl:inline max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/30 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Navigation bar */}
        <nav className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar text-xs border-t border-slate-900/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
