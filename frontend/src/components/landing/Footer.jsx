import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full py-6 bg-white/80 backdrop-blur border-t border-blue-100 text-center text-gray-500 text-sm mt-12">
    <span>&copy; {new Date().getFullYear()} <Link to="/" className="text-blue-600 font-semibold hover:underline">CloudVault</Link>. All rights reserved.</span>
  </footer>
);

export default Footer; 