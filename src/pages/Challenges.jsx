import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trophy, Calendar as CalendarIcon, Flame, CheckCircle, X } from 'lucide-react';

function ChallengeCalendar({ challenge, onToggleDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const start = new Date(challenge.startDate || challenge.createdAt);
  const duration = challenge.duration || 30;
  const end = new Date(start);
  end.setDate(end.getDate() + duration - 1);

  // Helper to check if a date string is between start and end inclusive
  const isActiveDate = (d) => {
    const startCopy = new Date(start);
    startCopy.setHours(0, 0, 0, 0);
    const endCopy = new Date(end);
    endCopy.setHours(23, 59, 59, 999);
    
    const time = d.getTime();
    return time >= startCopy.getTime() && time <= endCopy.getTime();
  };

  const toLocalDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y, m) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDayIdx = getFirstDayIndex(year, month);

  const days = [];
  // Blank cells before first day
  for (let i = 0; i < firstDayIdx; i++) {
    days.push(null);
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="card calendar-wrapper">
      <div className="calendar-header">
        <div>
          <h3 className="calendar-title">Consistency Map</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>Tap to mark your progress</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="nav-arrow-btn" onClick={handlePrevMonth}>&lt;</button>
          <span style={{ fontWeight: 800, fontSize: '15px', minWidth: '110px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button className="nav-arrow-btn" onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>

      <div className="calendar-days-grid">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="calendar-day-empty"></div>;
          
          const dateStr = toLocalDateKey(day);
          const isSelected = !!(challenge.markedDates && (challenge.markedDates[dateStr] || challenge.markedDates.get?.(dateStr)));
          const active = isActiveDate(day);
          const isToday = toLocalDateKey(new Date()) === dateStr;

          return (
            <div 
              key={dateStr} 
              className={`calendar-day ${active ? 'active' : 'disabled'} ${isToday ? 'today' : ''}`}
              onClick={() => active && onToggleDate(dateStr)}
            >
              <span className={`day-number ${isSelected ? 'selected-text' : ''}`}>{day.getDate()}</span>
              {isSelected && <div className="calendar-day-slash"></div>}
              {isToday && !isSelected && <div className="today-dot"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setChallenges(data);
      if (selectedChallenge) {
        const updatedSelected = data.find(c => c._id === selectedChallenge._id);
        setSelectedChallenge(updatedSelected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a challenge name.');
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          duration: Number(duration)
        })
      });

      if (res.ok) {
        fetchChallenges();
        setAddModalOpen(false);
        setName('');
        setDescription('');
        setDuration(30);
      }
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
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDate = async (dateStr) => {
    if (!selectedChallenge) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges/${selectedChallenge._id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedChallenge(updated);
        setChallenges(prev => prev.map(c => c._id === updated._id ? updated : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteChallenge = async (id) => {
    if (!window.confirm('Quit Challenge: Are you sure you want to quit this challenge? All history for this challenge will be lost.')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setShowDetail(false);
        setSelectedChallenge(null);
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toLocalDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = toLocalDateKey(new Date());

  const sortedChallenges = [...challenges].sort((a, b) => {
    const aDone = a.completedDays >= a.duration;
    const bDone = b.completedDays >= b.duration;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return 0;
  });

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      {!showDetail ? (
        <>
          {/* Header */}
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Your Challenges</h1>
              <p className="page-subtitle">
                {challenges.filter(c => c.completedDays < c.duration).length} active journeys
              </p>
            </div>
            <button className="gradient-btn" onClick={() => setAddModalOpen(true)}>
              <Plus size={20} />
              <span>New Challenge</span>
            </button>
          </div>

          {/* Grid */}
          <div className="challenge-grid">
            {sortedChallenges.map(item => {
              const progress = Math.min(100, Math.round((item.completedDays / item.duration) * 100));
              const isCompleted = progress >= 100;
              const isDoneToday = !!(item.markedDates && (item.markedDates[todayKey] || item.markedDates.get?.(todayKey)));

              return (
                <div
                  key={item._id}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedChallenge(item);
                    setShowDetail(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{item.name}</h3>
                      {item.description && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>{item.description}</p>}
                    </div>
                    {isCompleted && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10B981', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>
                        <Trophy size={12} />
                        <span>DONE</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div className="challenge-progress-row">
                      <span style={{ color: 'var(--text-muted)' }}>{isCompleted ? 'Finished' : 'In Progress'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="challenge-bar-bg">
                      <div
                        className="challenge-bar-fill"
                        style={{
                          width: `${progress}%`,
                          background: isCompleted ? 'var(--green-gradient)' : 'var(--primary-gradient)'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="challenge-footer">
                    <div className="footer-meta">
                      <div className="meta-val">
                        <CalendarIcon size={14} />
                        <span>{item.duration} days</span>
                      </div>
                      <div className="meta-val">
                        <Flame size={14} color="#F59E0B" />
                        <span>{item.streak || 0} streak</span>
                      </div>
                    </div>

                    <button
                      className={`challenge-check-btn ${isDoneToday ? 'completed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChallengeToday(item._id);
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{isDoneToday ? 'Done Today' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {challenges.length === 0 && (
              <div className="empty-container">
                <Trophy size={64} />
                <h3 className="empty-title">No Challenges Yet</h3>
                <p className="empty-desc">Start a new challenge to build better habits and track your progress.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Detailed Challenge View */
        selectedChallenge && (
          <div className="challenge-detail-view animate-fade-in">
            {/* Header Area with Gradient */}
            <div className="challenge-detail-header-card">
              <div className="detail-nav-row">
                <button className="detail-back-btn" onClick={() => setShowDetail(false)}>
                  &lt; Back
                </button>
                <span className="detail-nav-title">Daily Progress</span>
                <div style={{ width: '60px' }}></div>
              </div>

              <div className="detail-hero-section">
                <h2 className="detail-hero-name">{selectedChallenge.name}</h2>
                {selectedChallenge.description && (
                  <p className="detail-hero-desc">{selectedChallenge.description}</p>
                )}
                <div className="detail-progress-container">
                  <div className="detail-progress-track">
                    <div 
                      className="detail-progress-fill" 
                      style={{ width: `${Math.min(100, Math.round((selectedChallenge.completedDays / selectedChallenge.duration) * 100))}%` }}
                    ></div>
                  </div>
                  <span className="detail-progress-percent">
                    {Math.min(100, Math.round((selectedChallenge.completedDays / selectedChallenge.duration) * 100))}%
                  </span>
                </div>
              </div>

              <div className="detail-stats-row">
                <div className="detail-stat-item">
                  <span className="detail-stat-val">{selectedChallenge.completedDays}</span>
                  <span className="detail-stat-label">Days Done</span>
                </div>
                <div className="detail-stat-item">
                  <span className="detail-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedChallenge.streak || 0} <Flame size={18} color="#F59E0B" />
                  </span>
                  <span className="detail-stat-label">Streak</span>
                </div>
                <div className="detail-stat-item">
                  <span className="detail-stat-val">{Math.max(0, selectedChallenge.duration - selectedChallenge.completedDays)}</span>
                  <span className="detail-stat-label">Days Left</span>
                </div>
              </div>
            </div>

            {/* Calendar Consistency Map */}
            <ChallengeCalendar challenge={selectedChallenge} onToggleDate={toggleDate} />

            {/* Complete Winner Banner */}
            {selectedChallenge.completedDays >= selectedChallenge.duration && (
              <div className="winner-card">
                <Trophy size={48} color="#F59E0B" />
                <h3 className="winner-title">Challenge Complete!</h3>
                <p className="winner-sub">You've officially mastered this habit.</p>
              </div>
            )}

            {/* Quit Button */}
            <button 
              className="quit-challenge-btn"
              onClick={() => deleteChallenge(selectedChallenge._id)}
            >
              Quit Challenge
            </button>
          </div>
        )
      )}

      {/* Modal Add Challenge */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2 className="modal-title">New Challenge</h2>
              <button className="close-btn" onClick={() => setAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={createChallenge}>
              <div className="form-group">
                <label className="input-label">CHALLENGE NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 30 Days Cardio Challenge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">DESCRIPTION (OPTIONAL)</label>
                <textarea
                  className="form-input"
                  style={{ height: '80px', resize: 'none' }}
                  placeholder="What are the details of this challenge?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="input-label">DURATION (DAYS)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="365"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="gradient-btn" style={{ width: '100%', marginTop: '16px' }}>
                Create Challenge
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
