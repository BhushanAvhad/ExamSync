import { useState, useRef, useEffect } from 'react';
import {
  BrandLogoIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  UserIcon
} from '../ui/Icons';
import { Button } from '../ui/Button';

/**
 * ExamSync Navbar Component (Section 3, 4, 14, 15 - Final Revision)
 * Left: ExamSync logo
 * Center: Home, Features, How It Works, About (placeholders, no scroll sections)
 * Right: Theme toggle, Sign In (with custom 2-role popover), Create Account -> /register
 */
export function Navbar({
  currentPath = '/',
  onNavigate,
  theme = 'dark',
  onToggleTheme,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (currentPath !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = ['about', 'how-it-works', 'features', 'home'];
      const scrollPos = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const handleNavClick = (path) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const scrollToSection = (sectionId) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    if (currentPath !== '/') {
      handleNavClick('/');
      setTimeout(() => {
        if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    } else {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Left: Brand */}
        <button
          type="button"
          className="nav-brand"
          onClick={() => scrollToSection('home')}
          aria-label="ExamSync Home"
        >
          <div className="brand-icon-wrapper">
            <BrandLogoIcon size={18} />
          </div>
          <span className="brand-text">
            Exam<span className="brand-accent">Sync</span>
          </span>
        </button>

        {/* Center: Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <button
                type="button"
                className={`nav-link-btn ${currentPath === '/' && activeSection === 'home' ? 'active' : ''}`}
                onClick={() => scrollToSection('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link-btn ${currentPath === '/' && activeSection === 'features' ? 'active' : ''}`}
                onClick={() => scrollToSection('features')}
              >
                Features
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link-btn ${currentPath === '/' && activeSection === 'how-it-works' ? 'active' : ''}`}
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link-btn ${currentPath === '/' && activeSection === 'about' ? 'active' : ''}`}
                onClick={() => scrollToSection('about')}
              >
                About
              </button>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            type="button"
            className="nav-theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>

          {/* Sign In Dropdown Trigger */}
          <div className="sign-in-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${dropdownOpen ? 'is-active' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              id="sign-in-menu-btn"
            >
              <UserIcon size={14} />
              <span>Sign In</span>
              <ChevronDownIcon
                size={14}
                className={`dropdown-chevron ${dropdownOpen ? 'rotate' : ''}`}
              />
            </button>

            {/* Polished Glass Popover Dropdown (Section 14) */}
            {dropdownOpen && (
              <div
                className="sign-in-popover"
                role="menu"
                aria-labelledby="sign-in-menu-btn"
              >
                <div className="popover-header">
                  <span>Sign In As</span>
                </div>

                <div className="popover-options">
                  {/* Admin Option */}
                  <button
                    type="button"
                    className="popover-role-item"
                    role="menuitem"
                    onClick={() => handleNavClick('/admin-login')}
                  >
                    <div className="popover-role-icon admin">
                      <ShieldCheckIcon size={18} />
                    </div>
                    <div className="popover-role-text">
                      <span className="role-name">Admin</span>
                      <span className="role-sub">Administrator access</span>
                    </div>
                    <span className="popover-role-arrow" aria-hidden="true">
                      <ArrowRightIcon size={14} />
                    </span>
                  </button>

                  {/* Student Option */}
                  <button
                    type="button"
                    className="popover-role-item"
                    role="menuitem"
                    onClick={() => handleNavClick('/student-login')}
                  >
                    <div className="popover-role-icon student">
                      <GraduationCapIcon size={18} />
                    </div>
                    <div className="popover-role-text">
                      <span className="role-name">Student</span>
                      <span className="role-sub">Student access</span>
                    </div>
                    <span className="popover-role-arrow" aria-hidden="true">
                      <ArrowRightIcon size={14} />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Account Button -> /register */}
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRightIcon size={14} />}
            onClick={() => handleNavClick('/register')}
          >
            Create Account
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className={`nav-link-btn ${currentPath === '/' && activeSection === 'home' ? 'active' : ''}`}
          style={{ textAlign: 'left', padding: '8px 0' }}
          onClick={() => scrollToSection('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={`nav-link-btn ${currentPath === '/' && activeSection === 'features' ? 'active' : ''}`}
          style={{ textAlign: 'left', padding: '8px 0' }}
          onClick={() => scrollToSection('features')}
        >
          Features
        </button>
        <button
          type="button"
          className={`nav-link-btn ${currentPath === '/' && activeSection === 'how-it-works' ? 'active' : ''}`}
          style={{ textAlign: 'left', padding: '8px 0' }}
          onClick={() => scrollToSection('how-it-works')}
        >
          How It Works
        </button>
        <button
          type="button"
          className={`nav-link-btn ${currentPath === '/' && activeSection === 'about' ? 'active' : ''}`}
          style={{ textAlign: 'left', padding: '8px 0' }}
          onClick={() => scrollToSection('about')}
        >
          About
        </button>

        <div className="mobile-auth-section">
          <div className="mobile-section-label">SIGN IN AS</div>
          <button
            type="button"
            className="mobile-role-btn"
            onClick={() => handleNavClick('/admin-login')}
          >
            <ShieldCheckIcon size={16} />
            <span>Admin (Administrator access)</span>
          </button>
          <button
            type="button"
            className="mobile-role-btn"
            onClick={() => handleNavClick('/student-login')}
          >
            <GraduationCapIcon size={16} />
            <span>Student (Student access)</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => handleNavClick('/register')}
          >
            Create Account
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
