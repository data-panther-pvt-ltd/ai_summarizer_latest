'use client';

import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    router.replace('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center space-x-1 text-gray-600 hover:bg-red-100 px-2 py-1 rounded text-red-600 transition-colors"
    >
      <FiLogOut className="h-5 w-5" />
      <span>Logout</span>
    </button>
  );
}
