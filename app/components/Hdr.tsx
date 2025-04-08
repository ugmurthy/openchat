import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark'); // Default to dark theme

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <header className="navbar bg-base-100 text-base-content sticky top-0 z-10 shadow-lg">
      <div className="navbar-start">
        {/* App Name with Gradient */}
        <a
          className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
          href="#"
        >
          MyApp
        </a>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="navbar-end md:hidden">
        <label className="btn btn-ghost swap swap-rotate">
          <input type="checkbox" checked={isMenuOpen} onChange={toggleMenu} />
          {/* Hamburger Icon */}
          <svg className="swap-off fill-current w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {/* Close Icon */}
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
            <a className="hover:text-cyan-400" href="#">Home</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="#">Features</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="#">Pricing</a>
          </li>
          <li>
            <a className="hover:text-cyan-400" href="#">Contact</a>
          </li>
        </ul>
      </div>

      {/* Desktop Profile Icon and Theme Toggle */}
      <div className="navbar-end hidden md:flex items-center space-x-2">
        <a className="btn btn-ghost btn-circle hover:text-cyan-400" href="#">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </a>
        <label className="swap swap-rotate btn btn-ghost btn-circle">
          <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
          {/* Sun Icon (light mode) */}
          <svg className="swap-on fill-current w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {/* Moon Icon (dark mode) */}
          <svg className="swap-off fill-current w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </label>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-base-100 md:hidden">
          <ul className="menu p-4 shadow-lg">
            <li>
              <a className="hover:text-cyan-400" href="#">Home</a>
            </li>
            <li>
              <a className="hover:text-cyan-400" href="#">Features</a>
            </li>
            <li>
              <a className="hover:text-cyan-400" href="#">Pricing</a>
            </li>
            <li>
              <a className="hover:text-cyan-400" href="#">Contact</a>
            </li>
            <li>
              <a className="hover:text-cyan-400 flex items-center" href="#">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </a>
            </li>
            <li>
              <label className="swap swap-rotate flex items-center">
                <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                <svg className="swap-on fill-current w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg className="swap-off fill-current w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </label>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
