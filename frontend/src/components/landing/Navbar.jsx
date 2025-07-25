import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // adjust path if needed

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 bg-white/80 backdrop-blur border-b border-blue-100 shadow-md sticky top-0 z-30">
      <div className="flex w-full sm:w-auto items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 tracking-tight"
        >
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 32 32">
            <ellipse cx="16" cy="20" rx="10" ry="6" fill="#3B82F6" fillOpacity="0.15" />
            <path d="M24 18a6 6 0 10-11.75-1.75A4 4 0 008 22h16a4 4 0 000-8z" fill="#3B82F6" fillOpacity="0.3" />
            <ellipse cx="16" cy="22" rx="8" ry="4" fill="#3B82F6" fillOpacity="0.1" />
          </svg>
          <span>CloudVault</span>
        </Link>
        <button className="sm:hidden ml-2 p-2 rounded hover:bg-blue-50" onClick={() => setMenuOpen(m => !m)}>
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      <div className={`flex-col sm:flex-row flex w-full sm:w-auto gap-2 sm:gap-4 items-center mt-2 sm:mt-0 ${menuOpen ? 'flex' : 'hidden sm:flex'}`}>
        <a href="#storage-mode" className="text-blue-600 font-semibold px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition w-full sm:w-auto text-center">Choose Storage Mode</a>
        {!user ? (
          <>
            <Link to="/auth/login" className="text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition w-full sm:w-auto text-center">Login</Link>
            <Link to="/auth/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition w-full sm:w-auto text-center">Sign Up</Link>
          </>
        ) : (
          <>
            <span className="text-blue-700 font-semibold w-full sm:w-auto text-center">Hello, {user.username || "User"}</span>
            <button onClick={logout} className="text-red-600 font-semibold px-3 py-1 rounded hover:bg-red-50 transition w-full sm:w-auto text-center">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

 