// app/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-xl font-bold">Intellexa</Link>
      <div>
        <Link href="/dashboard" className="mr-4 hover:text-gray-300">Dashboard</Link>
        <Link href="/profile" className="mr-4 hover:text-gray-300">Profile</Link>
        {/* Add a Logout button here later */}
      </div>
    </nav>
  );
}