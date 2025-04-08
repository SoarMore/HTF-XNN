'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const users = [
  { username: "Bret", id: 1 },
  { username: "Antonette", id: 2 },
  { username: "Samantha", id: 3 },
  { username: "Karianne", id: 4 },
  { username: "Kamren", id: 5 },
  { username: "Leopoldo_Corkery", id: 6 },
  { username: "Elwyn.Skiles", id: 7 },
  { username: "Maxime_Nienow", id: 8 },
  { username: "Delphine", id: 9 },
  { username: "Moriah.Stanton", id: 10 },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    const user = users.find((u) => u.username === username);

    if (user && password === 'password123') {
      router.push(/employees/${user.id}); // Navigate to the specific user's page
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#def1ec] px-4">
      <h1 className="text-3xl font-bold text-[#0a2b24] mb-6">Login</h1>
      <div className="mb-4 w-full max-w-md">
        <label className="block text-lg text-[#0a2b24] mb-2">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-2 border border-[#0a2b24] rounded-full bg-transparent outline-none text-black"
        />
      </div>
      <div className="mb-6 w-full max-w-md">
        <label className="block text-lg text-[#0a2b24] mb-2">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border border-[#0a2b24] rounded-full bg-transparent outline-none text-black"
        />
      </div>
      <button
        onClick={handleLogin}
        className="px-6 py-2 border border-[#0a2b24] rounded-full text-lg text-[#0a2b24] hover:bg-[#cce7df]"
      >
        Login
      </button>
    </div>
  );
}