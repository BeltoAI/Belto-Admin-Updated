'use client'; // Mark this as a Client Component

import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation'; // Import usePathname

export default function RootLayoutClient({ children }) {
  const pathname = usePathname(); // Get the current route

  // Check if the current route should hide the navbar
  const shouldHideNavbar = pathname === '/' || 
                          pathname === '/login' || 
                          pathname === '/register' || 
                          pathname.startsWith('/reset-password');
  
  // Show navbar only when not in the routes that should hide it
  const shouldShowNavbar = !shouldHideNavbar;

  return (
    <>
      {shouldShowNavbar && <Navbar />} {/* Conditionally render Navbar */}
      {children}
      <ToastContainer />
    </>
  );
}