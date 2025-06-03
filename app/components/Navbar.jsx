"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  MdDashboard, 
  MdSchool, 
  MdSettings, 
  MdSmartToy,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md';
import { toast } from 'react-toastify';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    try {
      // Clear ALL localStorage items related to authentication
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Clear cookies manually as a backup
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      toast.success('Logged out successfully');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: <MdDashboard className="w-5 h-5" />, 
      href: '/dashboard',
    },
    { 
      name: 'Class Management', 
      icon: <MdSchool className="w-5 h-5" />, 
      href: '/class-management',
    },
    { 
      name: 'General Settings', 
      icon: <MdSettings className="w-5 h-5" />, 
      href: '/settings',
    },
    { 
      name: 'Logout', 
      icon: <MdLogout className="w-5 h-5" />,
      onClick: handleLogout,
      href: '#', // Using '#' as placeholder, the onClick handler will handle navigation
    }
  ];

  const isActive = (path) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="w-full bg-[#1C1C1C] text-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col px-6 py-3">
          {/* Top Section */}
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 md:h-24 md:w-24 relative">
                <Image
                  src="/logo.png"
                  alt="Belto Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-bold text-lg">
                  <span className="text-yellow-500">B</span>ELTO
                </span>
                <span className="text-gray-300 text-sm md:text-base">Admin Portal</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <MdClose className="w-6 h-6" />
              ) : (
                <MdMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          <hr className="w-full border-t border-gray-700 my-2" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex max-w-4xl mt-2 px-4 gap-4">
            <ul className="flex gap-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.onClick ? (
                    <button 
                      onClick={item.onClick}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                        ${isActive(item.href)
                          ? 'bg-yellow-400 text-black' 
                          : 'text-gray-300 hover:bg-yellow-400 hover:text-black'
                        }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link 
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                        ${isActive(item.href)
                          ? 'bg-yellow-400 text-black' 
                          : 'text-gray-300 hover:bg-yellow-400 hover:text-black'
                        }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute w-full bg-[#1C1C1C] z-50">
            <nav className="px-6 py-4">
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    {item.onClick ? (
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          item.onClick();
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left
                          ${isActive(item.href)
                            ? 'bg-yellow-400 text-black' 
                            : 'text-gray-300 hover:bg-yellow-400 hover:text-black'
                          }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ) : (
                      <Link 
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors
                          ${isActive(item.href)
                            ? 'bg-yellow-400 text-black' 
                            : 'text-gray-300 hover:bg-yellow-400 hover:text-black'
                          }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <hr className="w-full border-t border-gray-700" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;