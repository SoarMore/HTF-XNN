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
        console.error('No user found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/employees?username=${username}`);
        const data = await res.json();

        if (data.success) {
          setEmployee(data.employee);
        } else {
          console.error('Failed to load employee data:', data.message);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!employee) return <div className="p-8 text-center">Employee not found.</div>;

  return (
    <div className="h-screen overflow-y-scroll bg-[#def1ec] px-4 py-8 text-[#0a2b24]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <button className="px-6 py-2 border border-[#0a2b24] rounded-full text-lg">Profile</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <Image
              src="/user-icon.png"
              alt="User Icon"
              width={150}
              height={150}
              className="mb-4"
            />

            <div className="w-full border border-[#0a2b24] p-4 rounded-md bg-white min-h-[200px] mb-2">
              <p className="text-sm text-gray-500">Chat responses will appear here...</p>
            </div>

            <button className="px-4 py-2 border rounded-full bg-[#f1f9f7] mt-2">...........CHAT...............</button>
          </div>

          <div className="col-span-2">
            <div className="border border-[#0a2b24] rounded-md bg-white p-4">
              <table className="table-auto w-full text-left">
                <tbody>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Emp ID:</td><td className="py-2">{employee.id}</td></tr>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Name:</td><td className="py-2">{employee.name}</td></tr>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Department:</td><td className="py-2">{employee.department}</td></tr>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Date of Birth:</td><td className="py-2">{employee.dob}</td></tr>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Gender:</td><td className="py-2">{employee.gender}</td></tr>
                  <tr className="border-b border-[#0a2b24]"><td className="py-2 font-semibold">Contact Number:</td><td className="py-2">{employee.contact}</td></tr>
                  <tr><td className="py-2 font-semibold">Address:</td><td className="py-2">{employee.address}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border border-[#0a2b24] rounded-full px-4 py-3 bg-white">
                Attendance Status: {employee.attendance || 'Present'}
              </div>
              <div className="border border-[#0a2b24] rounded-full px-4 py-3 bg-white">
                Leave Balance: {employee.leave_balance ?? 'N/A'}
              </div>
              <div className="border border-[#0a2b24] rounded-full px-4 py-3 bg-white">
                <button className="bg-[#0a2b24] text-white px-4 py-1 rounded-full">Apply for Leave</button>
              </div>
              <div className="border border-[#0a2b24] rounded-2xl px-4 py-3 bg-white">
                Task for the Day: {employee.task || 'No task assigned'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
