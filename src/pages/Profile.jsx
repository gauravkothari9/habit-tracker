import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User as UserIcon, Moon, LogOut, Check, Save, Bell } from 'lucide-react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setPushSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handlePushToggle = async () => {
    if (pushLoading) return;
    setPushLoading(true);

    try {
      if (pushSubscribed) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          setPushSubscribed(false);
        }
      } else {
        // Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Notification permission denied.');
          setPushLoading(false);
          return;
        }

        // Fetch public key
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const keyRes = await fetch(`${baseUrl}/api/auth/vapid-public-key`);
        const { publicKey } = await keyRes.json();
        const convertedKey = urlBase64ToUint8Array(publicKey);

        // Subscribe
        const reg = await navigator.serviceWorker.ready;
        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });

        // Send to backend
        const res = await fetch(`${baseUrl}/api/auth/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(newSub)
        });

        if (res.ok) {
          setPushSubscribed(true);
        } else {
          alert('Failed to save subscription on server.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error setting up notifications: ' + e.message);
    } finally {
      setPushLoading(false);
    }
  };

  const triggerTestPush = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${baseUrl}/api/auth/trigger-test-push`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name cannot be empty.');
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert(e.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="profile-avatar-row">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-placeholder" style={{ fontSize: '36px' }}>
              {user.name.charAt(0)}
            </div>
          </div>
          <div className="profile-name-email">
            <h2 className="profile-name">{user.name}</h2>
            <span className="profile-email">{user.email}</span>
          </div>
        </div>

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            align: 'center',
            gap: '8px'
          }}>
            <Check size={18} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="profile-settings">
          <div className="form-group">
            <label className="input-label">DISPLAY NAME</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">PHONE NUMBER</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>



          <button type="submit" className="gradient-btn" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Preferences Widget */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Preferences</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <Moon size={20} />
            <span>Dark Theme</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <Bell size={20} />
            <span>Push Notifications</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pushSubscribed && (
              <button 
                type="button" 
                className="gradient-btn" 
                style={{ padding: '6px 12px', fontSize: '12px', boxShadow: 'none', background: 'var(--green-gradient)' }}
                onClick={triggerTestPush}
              >
                Test Alert
              </button>
            )}
            <label className="toggle-switch">
              <input type="checkbox" checked={pushSubscribed} onChange={handlePushToggle} disabled={pushLoading} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item" style={{ borderBottom: 'none', cursor: 'pointer' }} onClick={logout}>
          <div className="setting-label" style={{ color: '#EF4444' }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
