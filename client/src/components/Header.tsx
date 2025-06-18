import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const activeLink = 'text-[#3B7A57] font-semibold'; // golf green
  const hoverLink = 'hover:text-[#4C9A6A]'; // lighter green hover

  return (
    <header className="bg-gray-900/90 backdrop-blur-sm text-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <Link to="/dashboard" className="flex items-center gap-3">
        <img
            src="/icon2.png"
            alt="Fore Fathers League logo"
            className="w-18 h-18 object-contain"
        />
        <span className="text-2xl sm:text-3xl font-extrabold text-white hover:text-[#4C9A6A] transition-colors">
            Fore Fathers League
        </span>
        </Link>


        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 font-semibold text-sm sm:text-base">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `transition-colors ${isActive ? activeLink : hoverLink}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              `transition-colors ${isActive ? activeLink : hoverLink}`
            }
          >
            Matches
          </NavLink>
        </nav>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <NavLink
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block py-2 transition-colors ${isActive ? activeLink : hoverLink}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/matches"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block py-2 transition-colors ${isActive ? activeLink : hoverLink}`
            }
          >
            Matches
          </NavLink>
        </div>
      )}
    </header>
  );
}
