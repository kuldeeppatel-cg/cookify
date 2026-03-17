import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cookifyotpauthentication.onrender.com';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error sending OTP');
      
      setStep('otp');
      setMessage('OTP has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setStep('reset');
    setError('');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error resetting password');
      
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pt-24 pb-8 px-6">
      <div className="w-full max-w-[500px] bg-bg-secondary rounded-3xl border border-border-primary p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <Link to="/login" className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-4">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#f8fafc] to-[#94a3b8] bg-clip-text text-transparent">Reset Password</h1>
          <p className="text-text-secondary">Follow the steps to recover your account</p>
        </div>

        {error && <div className="text-error text-sm mb-4 p-3 bg-red-500/10 border-l-4 border-error rounded">{error}</div>}
        {message && <div className="text-accent text-sm mb-4 p-3 bg-accent/10 border-l-4 border-accent rounded">{message}</div>}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your registration email"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary transition-all focus:outline-none focus:border-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-50">
              {loading ? 'Sending...' : <><Mail size={20} /> Send OTP</>}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="otp">Enter 6-digit OTP</label>
              <input
                type="text"
                id="otp"
                maxLength="6"
                placeholder="000000"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-accent"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-hover transition-all">
              <ShieldCheck size={20} /> Verify OTP
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary focus:outline-none focus:border-accent"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary focus:outline-none focus:border-accent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-50">
              {loading ? 'Resetting...' : <><Lock size={20} /> Reset Password</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
