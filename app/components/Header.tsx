import React, { useState } from 'react';
import {ClerkProvider,  SignedIn ,UserButton} from '@clerk/react-router'
import { U } from 'node_modules/react-router/dist/development/fog-of-war-BQyvjjKg.mjs';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = <div className="navbar-center hidden md:flex">
                      <ul className="menu menu-horizontal px-1">
                        <li>
                          <a className="hover:text-cyan-400" href="/">Home</a>
                        </li>
                        <li>
                          <a className="hover:text-cyan-400" href="/api/v1/models">Models</a>
                        </li>
                        <li>
                          <a className="hover:text-cyan-400" href="/chat">Chat</a>
                        </li>
                        <li>
                          <a className="hover:text-cyan-400" href="#">Contact</a>
                        </li>
                      </ul>
                  </div>
  return (
    <header className="navbar bg-base-100 text-base-content sticky top-0 z-10 shadow-lg">
      <div className="navbar-start">
        {/* App Name with Gradient */}
        <a
          className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
          href="#"
        >
          IdeaFlow
        </a>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="navbar-end md:hidden">
        <label className="btn btn-ghost swap swap-rotate">
          <input type="checkbox" checked={isMenuOpen} onChange={toggleMenu} />
          {/* Hamburger Icon (visible when unchecked) */}
          <svg className="swap-off fill-current w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {/* Close Icon (visible when checked) */}
          <svg className="swap-on fill-current w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </label>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a className="hover:text-cyan-400" href="/">Home</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="/api/v1/models">Models</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="/chat">Chat</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="#">Contact</a>
          </li>
        </ul>
      </div>

      {/* Profile Icon (Desktop) */}
      <div className="navbar-end hidden md:flex">
        <UserButton />
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className="absolute top-full right-auto  w-full bg-base-100 md:hidden z-10">
          <ul className="menu p-4 shadow-lg">
          <li>
            <a className="hover:text-cyan-400" href="/">Home</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="/api/v1/models">Models</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="/chat">Chat</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="#">Contact</a>
          </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
