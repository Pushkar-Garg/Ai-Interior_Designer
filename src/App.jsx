import React, { useState } from 'react';
import { 
  Sparkles, 
  LogOut, 
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { DesignStudio } from './components/DesignStudio';

export default function App() {
  const { user, logout } = useAuthStore();
  const [view, setView] = useState('dashboard');

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-bottom border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-xl">Lumina</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
              <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-zinc-500" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {view === 'dashboard' ? (
          <Dashboard onNewDesign={() => setView('studio')} />
        ) : (
          <DesignStudio onBack={() => setView('dashboard')} />
        )}
      </main>

    </div>
  );
}
