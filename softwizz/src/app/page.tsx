import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex h-screen w-full">
      {/* Left Section */}
      <div className="w-1/2 relative">
        <Image
          src="/soft.png"
          alt="Soft Wizz Background"
          fill
          className="object-cover"
        />
        <div className="absolute top-1/3 left-1/4 text-center text-[#0a2b24]">
          <div className="text-6xl font-light leading-tight">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#ee7c54] text-4xl">✦</span>
            </div>
            <h1 className="mt-2">Softwizz</h1>
            <div className="mt-4">
              <span className="border border-[#0a2b24] rounded-full px-4 py-2 text-lg font-medium">
                Work Force Management
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-[#def1ec] flex flex-col justify-center items-start px-16">
        <h2 className="text-5xl font-bold text-[#0a2b24] mb-10">Welcome</h2>

        <Link href="/login" className="mb-6 w-full">
          <div className="flex items-center justify-between border border-[#0a2b24] rounded-full px-6 py-3 text-lg text-[#0a2b24] hover:bg-[#cce7df] transition-all">
            <span className="flex items-center gap-3">
              <span className="text-[#ee7c54]">✦</span> Admin
            </span>
            <span>&gt;</span>
          </div>
        </Link>

        <Link href="/login" className="w-full">
          <div className="flex items-center justify-between border border-[#0a2b24] rounded-full px-6 py-3 text-lg text-[#0a2b24] hover:bg-[#cce7df] transition-all">
            <span className="flex items-center gap-3">
              <span className="text-[#ee7c54]">✦</span>Employee
            </span>
            <span>&gt;</span>
          </div>
        </Link>
      </div>
    </main>
  );
}