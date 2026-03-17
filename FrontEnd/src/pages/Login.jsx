import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cookify-pou0.onrender.com';

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.status === 403) {
        // Account not verified
        setError('Account not verified. Redirecting to verification...');
        setTimeout(() => {
          navigate('/signup', { state: { email: data.email, step: 'otp' } });
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', data.user.username);
      localStorage.setItem('currentUserId', data.user._id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pt-24 pb-8 px-6">
      <div className="flex flex-col-reverse lg:flex-row w-full max-w-[1000px] bg-bg-secondary rounded-3xl border border-border-primary overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex-1 flex flex-col py-12 px-8 max-w-full lg:max-w-[50%]">
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="mb-10">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#f8fafc] to-[#94a3b8] bg-clip-text text-transparent">Welcome Back</h1>
              <p className="text-text-secondary">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="p-0 border-none bg-transparent backdrop-filter-none">
              {error && <div className="text-error text-sm mb-4 p-3 bg-red-500/10 border-l-4 border-error rounded">{error}</div>}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="identifier">Email or Username</label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary text-base transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,116,120,0.2)]"
                  placeholder="Enter your email or username"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-text-primary" htmlFor="password">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-sm text-accent hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary text-base transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,116,120,0.2)]"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 bg-accent text-white hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,116,120,0.3)] disabled:opacity-50">
                {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
              </button>

              <div className="mt-8 text-center text-sm text-text-secondary">
                Don't have an account? <Link to="/signup" className="text-accent font-semibold transition-colors duration-200 hover:underline">Sign up</Link>
              </div>
            </form>
          </div>
        </div>

        <div className="block lg:flex-1 relative bg-black min-h-[280px] lg:min-h-auto w-full">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
            <source src="https://res.cloudinary.com/dw4j19xmz/video/upload/v1773396205/Remove_background_project_rzuxmc.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent lg:bg-gradient-to-r lg:from-bg-secondary lg:via-transparent lg:to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
