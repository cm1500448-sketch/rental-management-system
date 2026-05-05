import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/client.js';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (_) {
      // ignore errors — still log out client-side
    }
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          RentManager
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user?.role !== 'tenant' && (
            <>
              <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
              <Link to="/properties" className="hover:text-blue-200 transition-colors">Properties</Link>
              <Link to="/tenants" className="hover:text-blue-200 transition-colors">Tenants</Link>
              <Link to="/leases" className="hover:text-blue-200 transition-colors">Rentals</Link>
              <Link to="/payments" className="hover:text-blue-200 transition-colors">Payments</Link>
              <Link to="/bills" className="hover:text-blue-200 transition-colors">Bills</Link>
              <Link to="/bills/unpaid" className="hover:text-blue-200 transition-colors">Unpaid</Link>
            </>
          )}
          {user?.role === 'tenant' && (
            <Link to="/portal/bills" className="hover:text-blue-200 transition-colors">My Bills</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-blue-200">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          {user?.role !== 'tenant' && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Dashboard</Link>
              <Link to="/properties" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Properties</Link>
              <Link to="/tenants" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Tenants</Link>
              <Link to="/leases" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Rentals</Link>
              <Link to="/payments" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Payments</Link>
              <Link to="/bills" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Bills</Link>
              <Link to="/bills/unpaid" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">Unpaid Bills</Link>
            </>
          )}
          {user?.role === 'tenant' && (
            <Link to="/portal/bills" onClick={() => setMenuOpen(false)} className="hover:text-blue-200">My Bills</Link>
          )}
          <span className="text-blue-300">{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="text-left hover:text-blue-200">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
