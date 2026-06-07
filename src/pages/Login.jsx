import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, CheckCircle2, Camera } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUri(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your name');
        await register(name.trim(), email.trim(), password, phone.trim(), photoUri.trim());
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <Target size={36} />
          </div>
          <h2 className="auth-title">Habit Master</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Create an account to start your journey' : 'Sign in to track your daily progress'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                <label className="input-label" style={{ marginBottom: '12px' }}>PROFILE PHOTO</label>
                <div className="profile-avatar-wrapper" onClick={triggerFileInput} style={{ cursor: 'pointer', position: 'relative' }}>
                  {photoUri ? (
                    <img src={photoUri} alt="Avatar" className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar-placeholder" style={{ fontSize: '36px' }}>
                      <Camera size={32} />
                    </div>
                  )}
                  <div className="profile-avatar-hover-overlay">
                    <Camera size={20} color="white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="input-label">YOUR NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">PHONE NUMBER</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="input-label">EMAIL ADDRESS</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label">PASSWORD</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="gradient-btn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span className="auth-toggle-link" onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setPhone('');
            setPhotoUri('');
          }}>
            {isRegister ? 'Sign In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
}
