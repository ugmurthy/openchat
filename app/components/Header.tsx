import React, { useState } from 'react';
import { ClerkProvider, SignedIn, UserButton } from '@clerk/react-router';

// Define the MenuItem type for better type safety
interface MenuItem {
  label: string;
  url: string;
}

// Props interface for Header component
interface HeaderProps {
  menuItems?: MenuItem[];
  appName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  menuItems = [
    { label: 'Home', url: '/' },
    { label: 'Models', url: '/api/v1/models' },
    { label: 'Chat', url: '/chat' },
    { label: 'Contact', url: '#' }
  ],
  appName = 'IdeaFlow'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to render the menu items
  const renderMenuItems = () => {
    return menuItems.map((item, index) => (
      <li key={index}>
        <a className="hover:text-cyan-400" href={item.url}>
          {item.label}
        </a>
      </li>
    ));
  };

  return (
    <header className="navbar bg-base-100 text-base-content sticky top-0 z-10 shadow-lg">
      <div className="navbar-start">
        {/* App Name with Gradient */}
        <a
          className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
          href="#"
        >
          {appName}
        </a>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="navbar-end md:hidden">
        <label className="btn btn-ghost swap swap-rotate rounded-full p-1 flex items-center justify-center w-10 h-10 hover:bg-gray-200">
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
          {renderMenuItems()}
        </ul>
      </div>

      {/* Profile Icon (Desktop) */}
      <div className="navbar-end hidden md:flex">
        <UserButton />
      </div>

      {/* Mobile Menu (Dropdown) - Positioned under hamburger icon */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 bg-base-100 md:hidden z-10">
          <ul className="menu p-4 shadow-lg rounded-bl-lg">
            {renderMenuItems()}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;