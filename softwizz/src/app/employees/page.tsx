'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string };
};

export default function EmployeesPage() {
  const [user, setUser] = useState<User | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(https://jsonplaceholder.typicode.com/users/${id});
      const data: User = await res.json();
      setUser(data);
    };

    fetchUser();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#def1ec] p-10">
      <h1 className="text-3xl font-bold text-[#0a2b24] mb-6">Employee Details</h1>
      {user ? (
        <div className="max-w-4xl bg-[#cce7df] p-6 rounded-lg text-[#0a2b24]">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Website:</strong> {user.website}</p>
          <p><strong>Company:</strong> {user.company.name} - {user.company.catchPhrase}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}