import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Routines from './pages/Routines';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { Target, CheckSquare, Trophy, User as UserIcon, LogOut } from 'lucide-react';
import './App.css';

function MainApp() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'routines':
        return <Routines />;
      case 'challenges':
        return <Challenges />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background ambient mesh glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Desktop Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo-section">
            <Target size={28} />
            <span className="logo-title">Habit Master</span>
          </div>
          <nav className="nav-links">
            <button
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Target size={20} />
              <span>Journey</span>
            </button>
            <button
              className={`nav-link ${activeTab === 'routines' ? 'active' : ''}`}
              onClick={() => setActiveTab('routines')}
            >
              <CheckSquare size={20} />
              <span>Routines</span>
            </button>
            <button
              className={`nav-link ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              <Trophy size={20} />
              <span>Challenges</span>
            </button>
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon size={20} />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        <button className="nav-link" onClick={logout} style={{ border: 'none', background: 'none', width: '100%', justifyContent: 'flex-start', color: '#EF4444' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="mobile-nav">
        <a
          href="#"
          className={`mobile-nav-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
        >
          <Target size={22} />
          <span>Journey</span>
        </a>
        <a
          href="#"
          className={`mobile-nav-link ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('routines'); }}
        >
          <CheckSquare size={22} />
          <span>Routines</span>
        </a>
        <a
          href="#"
          className={`mobile-nav-link ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('challenges'); }}
        >
          <Trophy size={22} />
          <span>Challenges</span>
        </a>
        <a
          href="#"
          className={`mobile-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
        >
          <UserIcon size={22} />
          <span>Profile</span>
        </a>
      </nav>

      {/* Main Workspace Frame */}
      <main className="main-content">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0F172A', color: 'white' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading Habit Master...</div>
      </div>
    );
  }

  return user ? <MainApp /> : <Login />;
}
