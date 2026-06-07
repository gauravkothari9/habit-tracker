import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Flame, CheckCircle, Award, Droplet, Plus, Minus, ChevronRight } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [water, setWater] = useState({ count: 0 });
  const [activityMap, setActivityMap] = useState({});
  const [quote, setQuote] = useState('');

  const quotes = [
    "Small steps lead to big results.",
    "Consistency is the key to mastery.",
    "Your habits define your future.",
    "Don't stop until you're proud.",
    "Excellence is not an act, but a habit."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const headers = { 'Authorization': `Bearer ${user.token}` };
      
      // Fetch Routines
      const resRoutines = await fetch(`${baseUrl}/api/routines`, { headers });
      const dataRoutines = await resRoutines.json();
      setRoutines(dataRoutines);

      // Fetch Challenges
      const resChallenges = await fetch(`${baseUrl}/api/challenges`, { headers });
      const dataChallenges = await resChallenges.json();
      setChallenges(dataChallenges);

      // Fetch Water
      const resWater = await fetch(`${baseUrl}/api/water`, { headers });
      const dataWater = await resWater.json();
      setWater(dataWater);

      // Build Activity Heatmap Map
      const map = {};
      dataRoutines.forEach(r => {
        if (r.completedDates) {
          r.completedDates.forEach(date => {
            map[date] = (map[date] || 0) + 1;
          });
        }
      });
      dataChallenges.forEach(c => {
        if (c.markedDates) {
          Object.keys(c.markedDates).forEach(date => {
            map[date] = (map[date] || 0) + 1;
          });
        }
      });
      setActivityMap(map);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  const handleWaterUpdate = async (action) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/water/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const updated = await res.json();
      setWater(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChallengeToday = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPast90Days = () => {
    const dates = [];
    for (let i = 90; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const toLocalDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);

  const completedRoutinesCount = routines.filter(r => r.completed).length;
  const progressPercent = routines.length > 0 ? Math.round((completedRoutinesCount / routines.length) * 100) : 0;

  useEffect(() => {
    if (progressPercent === 100 && routines.length > 0 && !celebrationTriggered) {
      setShowCelebration(true);
      setCelebrationTriggered(true);
    } else if (progressPercent < 100) {
      setCelebrationTriggered(false);
    }
  }, [progressPercent, routines]);

  const activeChallenges = challenges.filter(c => c.completedDays < c.duration);
  const bestStreak = routines.length > 0 ? Math.max(...routines.map(r => r.streak || 0)) : 0;

  // Compile 90 days columns (7 days per column)
  const past90Days = getPast90Days();
  const columns = [];
  for (let i = 0; i < 91; i += 7) {
    columns.push(past90Days.slice(i, i + 7));
  }

  const todayKey = toLocalDateKey(new Date());

  return (
    <div className="animate-fade-in">
      {/* 100% Completion Celebration Modal */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="celebration-ring">
              <Trophy size={48} />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>Perfect Day! 🎯</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Sensational job! You completed 100% of your daily routines today. Keep the flame burning!
            </p>
            <button className="gradient-btn" onClick={() => setShowCelebration(false)}>
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Good Day, {user.name}!</p>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Your Journey</h1>
        </div>
        {user.photoUri ? (
          <img src={user.photoUri} alt="Avatar" className="profile-avatar" style={{ width: '48px', height: '48px' }} />
        ) : (
          <div className="profile-avatar-placeholder" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
            {user.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Motivation Quote */}
      <div className="motivation-card">
        <Sparkles size={24} />
        <div className="motivation-text">"{quote}"</div>
        <div className="motivation-author">— Daily Habit Master</div>
      </div>

      {/* Stats Widgets */}
      <div className="stats-grid">
        <div className="card stat-box">
          <div className="stat-icon-bg" style={{ background: 'var(--orange-gradient)' }}>
            <Flame size={20} />
          </div>
          <span className="stat-val">{bestStreak}</span>
          <span className="stat-label">Best Streak</span>
        </div>
        <div className="card stat-box">
          <div className="stat-icon-bg" style={{ background: 'var(--green-gradient)' }}>
            <CheckCircle size={20} />
          </div>
          <span className="stat-val">{completedRoutinesCount}</span>
          <span className="stat-label">Done Today</span>
        </div>
      </div>

      {/* Daily Progress Widget */}
      <div className="card progress-card complete-glow">
        <div className="progress-header">
          <div className="progress-title-row">
            <Award size={18} />
            <span>ROUTINE PROGRESS</span>
          </div>
        </div>
        <div className="progress-row">
          <div className="progress-pct">{progressPercent}%</div>
          <div className="progress-info">{completedRoutinesCount} of {routines.length} completed</div>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Water tracker widget */}
      <div className="card water-card">
        <div className="water-header">
          <div>
            <h3 className="water-title">Water Intake</h3>
            <span className="water-subtitle">Stay hydrated today</span>
          </div>
          <Droplet size={24} color="#3B82F6" fill="#3B82F6" />
        </div>
        
        <div className="water-widget-row">
          <div className="water-glass-cup">
            <div className="water-fluid-fill" style={{ height: `${Math.min(100, ((water.count || 0) / 8) * 100)}%` }}></div>
          </div>
          <div className="water-controls">
            <div className="glass-container">
              <span className="water-count">{water.count || 0}</span>
              <span className="water-unit">/ 8 cups</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="water-btn" onClick={() => handleWaterUpdate('remove')}>
                <Minus size={20} />
              </button>
              <button className="water-btn add" onClick={() => handleWaterUpdate('add')}>
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 90-Day Activity Heatmap widget */}
      <div className="card heatmap-card">
        <div className="heatmap-legend">
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Activity Heatmap (Past 90 Days)</span>
          <div className="legend-squares">
            <div className="legend-square" style={{ backgroundColor: 'var(--bg-input)' }}></div>
            <div className="legend-square" style={{ backgroundColor: '#C7D2FE' }}></div>
            <div className="legend-square" style={{ backgroundColor: '#818CF8' }}></div>
            <div className="legend-square" style={{ backgroundColor: '#4F46E5' }}></div>
          </div>
        </div>
        <div className="heatmap-grid-scroll">
          <div className="heatmap-grid">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="heatmap-column">
                {col.map((date) => {
                  const count = activityMap[date] || 0;
                  let color = 'var(--bg-input)';
                  if (count === 1) color = '#C7D2FE';
                  else if (count === 2) color = '#818CF8';
                  else if (count >= 3) color = '#4F46E5';

                  return (
                    <div
                      key={date}
                      className="heatmap-square"
                      style={{ backgroundColor: color }}
                      data-date={`${date} (${count} actions)`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Challenges list widget */}
      <div className="section-title-row">
        <h3 className="section-title">Active Challenges</h3>
        <span className="view-all-link" onClick={() => setActiveTab('challenges')}>View All</span>
      </div>

      <div className="habit-card-list">
        {activeChallenges.map(challenge => {
          const isDoneToday = !!(challenge.markedDates && challenge.markedDates[todayKey]);

          return (
            <div key={challenge._id} className="card habit-card">
              <div className="habit-info">
                <span className="habit-name">{challenge.name}</span>
                <span className="habit-desc">{challenge.completedDays} / {challenge.duration} days complete</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  {Math.round((challenge.completedDays / challenge.duration) * 100)}%
                </span>
                <button
                  className={`challenge-check-btn ${isDoneToday ? 'completed' : ''}`}
                  onClick={() => toggleChallengeToday(challenge._id)}
                >
                  <CheckCircle size={16} />
                  <span>{isDoneToday ? 'Done Today' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {activeChallenges.length === 0 && (
          <div className="card empty-container">
            <span style={{ color: 'var(--text-secondary)' }}>No active challenges. Start one now!</span>
          </div>
        )}
      </div>
    </div>
  );
}
