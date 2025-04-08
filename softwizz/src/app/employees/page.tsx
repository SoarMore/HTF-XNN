'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Employee = {
  id: number;
  name: string;
  department: string;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  attendance?: string;
  leave_balance?: number;
  task?: string;
};

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const username = localStorage.getItem('username');
      if (!username) {
        console.error('No username found in localStorage.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/employees?username=${encodeURIComponent(username)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setEmployee(data.employee);
        } else {
          console.error('Error loading employee:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!employee) return <div className="p-8 text-center">Employee not found.</div>;

  return (
    <div className="h-screen overflow-y-auto bg-[#def1ec] px-4 py-8 text-[#0a2b24]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <button className="px-6 py-2 border border-[#0a2b24] rounded-full text-lg hover:bg-[#0a2b24] hover:text-white transition">
            Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Image + Chat Placeholder */}
          <div className="flex flex-col items-center">
            <Image
              src="/user-icon.png"
              alt="User Icon"
              width={150}
              height={150}
              className="mb-4 rounded-full"
              priority
            />

            <div className="w-full border border-[#0a2b24] p-4 rounded-md bg-white min-h-[200px] mb-2">
              <p className="text-sm text-gray-500">Chat responses will appear here...</p>
            </div>

            <button className="px-4 py-2 border rounded-full bg-[#f1f9f7] hover:bg-[#cceae3] transition">
              Chat
            </button>
          </div>

          {/* Right Section: Employee Info + Cards */}
          <div className="col-span-2">
            <div className="border border-[#0a2b24] rounded-md bg-white p-4">
              <table className="table-auto w-full text-left">
                <tbody>
                  <Row label="Emp ID" value={employee.id} />
                  <Row label="Name" value={employee.name} />
                  <Row label="Department" value={employee.department} />
                  <Row label="Date of Birth" value={employee.dob} />
                  <Row label="Gender" value={employee.gender} />
                  <Row label="Contact Number" value={employee.contact} />
                  <Row label="Address" value={employee.address} />
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card label="Attendance Status" value={employee.attendance || 'Present'} />
              <Card label="Leave Balance" value={employee.leave_balance ?? 'N/A'} />
              <div className="border border-[#0a2b24] rounded-full px-4 py-3 bg-white text-center">
                <button className="bg-[#0a2b24] text-white px-4 py-1 rounded-full hover:bg-[#15443b] transition">
                  Apply for Leave
                </button>
              </div>
              <Card
                label="Task for the Day"
                value={employee.task || 'No task assigned'}
                rounded="2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <tr className="border-b border-[#0a2b24]">
      <td className="py-2 font-semibold">{label}:</td>
      <td className="py-2">{value}</td>
    </tr>
  );
}

function Card({
  label,
  value,
  rounded = 'full',
}: {
  label: string;
  value: string | number;
  rounded?: 'full' | '2xl';
}) {
  return (
    <div
      className={`border border-[#0a2b24] rounded-${rounded} px-4 py-3 bg-white text-sm md:text-base`}
    >
      {label}: {value}
    </div>
  );
}
