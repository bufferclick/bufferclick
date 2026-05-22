import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'admin' && password === 'bufferclickbutterlick') {
      // Store login state in sessionStorage
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin/panel');
    } else {
      setError('Invalid credentials');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white text-black rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:border-gray-600"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-center text-sm text-gray-600 hover:text-black"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
