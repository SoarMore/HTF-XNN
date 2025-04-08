'use client'
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Fake login check — in production, validate this
    if (username && password) {
      router.push('/employees');
    } else {
      alert('Please enter both username and password');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#def1ec] px-4">
      <div className="mb-10">
        <Image
          src="/profile.png"
          alt="User Icon"
          width={200}
          height={200}
        />
      </div>

      <div className="mb-4 w-full max-w-md">
        <label className="block text-lg text-[#0a2b24] mb-2">User Name:</label>
        <input
          type="text"
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-[#0a2b24] rounded-full bg-transparent outline-none text-black"
        />
      </div>

      <div className="mb-6 w-full max-w-md">
        <label className="block text-lg text-[#0a2b24] mb-2">Password:</label>
        <input
          type="password"
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-[#0a2b24] rounded-full bg-transparent outline-none text-black"
        />
      </div>

      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-6 py-2 border border-[#0a2b24] rounded-full text-lg text-[#0a2b24] hover:bg-[#cce7df] transition-all"
      >
        <span className="text-[#ee7c54]">✦</span>

        Login
      </button>
    </div>
  );
}