import { useState } from 'react';
import axios from 'axios';
import { GoogleLoginButton, FacebookLoginButton, LinkedInLoginButton } from '../components/ui/SocialLoginButtons';
import { Link, useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`http://localhost:5000/auth/login`, {
        email,
        password
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      alert('Signed in!');
      navigate('/'); // You can change it to /dashboard or any route
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <span className="border-b border-slate-200 flex-grow"></span>
          <span>or sign in with</span>
          <span className="border-b border-slate-200 flex-grow"></span>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <GoogleLoginButton />
          <FacebookLoginButton />
          <LinkedInLoginButton />
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
