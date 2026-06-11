'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id.toString());
        setMessage(`התחברת בהצלחה, שלום ${data.user.name}`);
        setTimeout(() => router.push('/preferences'), 1000);
      } else {
        setMessage(`שגיאה: ${data.error}`);
      }
    } catch (err) {
      setMessage('שגיאת התחברות');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">התחברות עובד</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">אימייל</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              value={email} onChange={e => setEmail(e.target.value)} required 
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">סיסמה</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              value={password} onChange={e => setPassword(e.target.value)} required 
              dir="ltr"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            התחבר
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm font-medium text-gray-800">{message}</p>}
      </div>
    </div>
  );
}
