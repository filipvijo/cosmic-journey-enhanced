import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import Firebase auth instance
import './LoginPage.css';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful');
        navigate('/'); // Navigate to the main app route
      } else {
        // Signup logic
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false); // Reset loading state
          return; // Stop execution if passwords don't match
        }
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('Signup successful');
        navigate('/'); // Navigate to the main app route
      }
    } catch (err: any) {
      console.error('Error during authentication:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{isLogin ? 'LOGIN' : 'SIGN UP'}</h1>
      {error && <p className="login-error">{error}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          autoComplete="email"
          required // Add required attribute
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          // Adjust autocomplete based on mode
          autoComplete={isLogin ? "current-password" : "new-password"}
          required // Add required attribute
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="login-input"
            autoComplete="new-password"
            required // Add required attribute
          />
        )}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'LOGIN' : 'SIGN UP'}
        </button>
      </form>
      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          className="toggle-button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
      <a href="/forgot-password" className="forgot-password-link">
        Forgot password?
      </a>
    </div>
  );
}
