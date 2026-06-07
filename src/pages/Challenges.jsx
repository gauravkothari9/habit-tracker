import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trophy, Calendar, Flame, CheckCircle, X } from 'lucide-react';

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
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

  const deleteChallenge = async (id) => {
    if (!window.confirm('Delete Challenge: Are you sure?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/challenges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setDetailModalOpen(false);
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

  // Sort challenges (active first, finished last)
  const sortedChallenges = [...challenges].sort((a, b) => {
    const aDone = a.completedDays >= a.duration;
    const bDone = b.completedDays >= b.duration;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return 0;
  });

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Your Challenges</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
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
                setDetailModalOpen(true);
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
                    <Calendar size={14} />
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

      {/* Modal Detailed View */}
      {detailModalOpen && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Challenge Info</h2>
              <button className="close-btn" onClick={() => setDetailModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedChallenge.name}</h3>
                {selectedChallenge.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: 1.5 }}>
                    {selectedChallenge.description}
                  </p>
                )}
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-input)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Goal Duration</span>
                  <span style={{ fontWeight: 700 }}>{selectedChallenge.duration} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Days</span>
                  <span style={{ fontWeight: 700 }}>{selectedChallenge.completedDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Current Streak</span>
                  <span style={{ fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={16} />
                    {selectedChallenge.streak || 0} Days
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  className="gradient-btn"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => {
                    toggleChallengeToday(selectedChallenge._id);
                  }}
                >
                  Toggled Log Today
                </button>
                <button
                  className="gradient-btn"
                  style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', flex: 1, padding: '12px', boxShadow: 'none' }}
                  onClick={() => deleteChallenge(selectedChallenge._id)}
                >
                  Delete Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
