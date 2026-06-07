import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Flame, Coffee, Edit, Trash, Lock, ClipboardList, Check, X } from 'lucide-react';

export default function Routines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [specificDays, setSpecificDays] = useState([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/routines`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setRoutines(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRoutine = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/routines/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchRoutines();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRoutine = async (id) => {
    if (!window.confirm('Delete Habit: Are you sure?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/routines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchRoutines();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setName('');
    setDescription('');
    setFrequency('daily');
    setSpecificDays([]);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setFrequency(item.frequency || 'daily');
    setSpecificDays(item.specificDays || []);
    setModalOpen(true);
  };

  const saveHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a name.');
    if (frequency === 'specific' && specificDays.length === 0) {
      return alert('Please select at least one day.');
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const body = {
        name: name.trim(),
        description: description.trim(),
        frequency,
        specificDays: frequency === 'specific' ? specificDays : []
      };

      let res;
      if (editItem) {
        res = await fetch(`${baseUrl}/api/routines/${editItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${baseUrl}/api/routines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(body)
        });
      }

      if (res.ok) {
        fetchRoutines();
        setModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDay = (day) => {
    if (specificDays.includes(day)) {
      setSpecificDays(specificDays.filter(d => d !== day));
    } else {
      setSpecificDays([...specificDays, day]);
    }
  };

  const todayDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Daily Routine</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
            {routines.filter(r => r.completed).length} of {routines.length} completed
          </p>
        </div>
        <button className="gradient-btn" onClick={openAddModal}>
          <Plus size={20} />
          <span>New Habit</span>
        </button>
      </div>

      {/* List */}
      <div className="habit-card-list">
        {routines.map(item => {
          const isDueToday = item.frequency === 'daily' || !item.frequency || (item.frequency === 'specific' && item.specificDays?.includes(todayDayName));

          return (
            <div key={item._id} className="card habit-card" style={{ opacity: isDueToday ? 1 : 0.7 }}>
              <div className="habit-info">
                <span className={`habit-name ${item.completed ? 'completed' : ''}`}>{item.name}</span>
                {item.description && <span className="habit-desc">{item.description}</span>}
                
                {isDueToday ? (
                  <span className="streak-tag">
                    <Flame size={14} />
                    <span>{item.streak || 0} days streak</span>
                  </span>
                ) : (
                  <span className="rest-tag">
                    <Coffee size={14} />
                    <span>Rest Day</span>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Actions */}
                <div className="routine-actions">
                  <button className="action-icon-btn" onClick={() => openEditModal(item)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-icon-btn delete" onClick={() => deleteRoutine(item._id)}>
                    <Trash size={16} />
                  </button>
                </div>

                {/* Completion Checkbox */}
                {isDueToday ? (
                  <div
                    className={`checkbox-circle ${item.completed ? 'checked' : ''}`}
                    onClick={() => toggleRoutine(item._id)}
                  >
                    {item.completed && <Check size={18} />}
                  </div>
                ) : (
                  <div
                    className="checkbox-circle locked"
                    onClick={() => alert('This routine is not scheduled for today.')}
                  >
                    <Lock size={14} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {routines.length === 0 && (
          <div className="empty-container">
            <ClipboardList size={64} />
            <h3 className="empty-title">No Habits Yet</h3>
            <p className="empty-desc">Add your first daily habit to start tracking your consistency.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Habit' : 'New Habit'}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveHabit}>
              <div className="form-group">
                <label className="input-label">HABIT NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Morning Meditation"
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
                  placeholder="Why is this habit important?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="input-label">FREQUENCY</label>
                <div className="freq-row">
                  <button
                    type="button"
                    className={`freq-btn ${frequency === 'daily' ? 'active' : ''}`}
                    onClick={() => setFrequency('daily')}
                  >
                    Everyday
                  </button>
                  <button
                    type="button"
                    className={`freq-btn ${frequency === 'specific' ? 'active' : ''}`}
                    onClick={() => setFrequency('specific')}
                  >
                    Specific Days
                  </button>
                </div>
              </div>

              {frequency === 'specific' && (
                <div className="form-group">
                  <label className="input-label">SELECT DAYS</label>
                  <div className="days-row">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                      const active = specificDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${active ? 'active' : ''}`}
                          onClick={() => toggleDay(day)}
                        >
                          {day.charAt(0)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" className="gradient-btn" style={{ width: '100%', marginTop: '16px' }}>
                {editItem ? 'Save Changes' : 'Create Habit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
