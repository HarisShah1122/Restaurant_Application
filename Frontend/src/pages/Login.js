import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (error) emailRef.current.focus();
  }, [error]);

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let progress = 0;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 10));
    }, 100);
    try {
      const response = await axios.post('http://localhost:8081/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setToastMessage('Login successful! Redirecting...');
      setShowToast(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setToastMessage(err.response?.data?.error || 'Login failed');
      setShowToast(true);
    } finally {
      setLoading(false);
      clearInterval(interval);
      setProgress(0);
    }
  };

  return (
    <div className="row justify-content-center" style={{ overflowX: 'hidden' }}>
      <div className="col-md-6">
        <div className="card mt-5 animate__animated animate__zoomIn">
          <div className="card-body p-5">
            <h2 className="card-title text-center mb-4 text-primary">Welcome Back to Delights: Feast with Flavor!</h2>
            <p className="text-center text-muted mb-4">Sign in to enjoy authentic Pakistani flavors</p>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}{' '}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Email</label>
                <input
                  ref={emailRef}
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., muhammad.ali@example.com"
                  required
                />
              </div>
              <div className="mb-4 position-relative">
                <label className="form-label">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  required
                />
              </div>
              <div className="mb-4">
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Login'}
              </button>
              <p className="mt-3 text-center">
                New here?{' '}
                <Link to="/register" className="text-decoration-none text-primary fw-bold">
                  Join Us Now!
                </Link>
              </p>
            </form>
          </div>
        </div>
        <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      </div>
    </div>
  );
}

export default Login;
