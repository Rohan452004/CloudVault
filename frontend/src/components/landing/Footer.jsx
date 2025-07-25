import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter } from "react-icons/fa";

const Footer = () => (
  <footer className="w-full py-4 sm:py-6 bg-white/80 backdrop-blur border-t border-blue-100 text-center text-gray-500 text-xs sm:text-sm mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-2">
    <span>&copy; {new Date().getFullYear()} <Link to="/" className="text-blue-600 font-semibold hover:underline">CloudVault</Link>. All rights reserved.</span>
    {/* <span className="flex gap-3 justify-center mt-2 sm:mt-0">
      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700"><FaGithub className="inline w-5 h-5" /></a>
      <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaTwitter className="inline w-5 h-5" /></a>
    </span> */}
  </footer>
);

export default Footer; 