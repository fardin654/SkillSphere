import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  Menu,
  X,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  // Track scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const navLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/login', label: 'Login', icon: null },
        { to: '/register', label: 'Register', icon: null },
      ]
    }
    if (user?.role === 'teacher') {
      return [
        { to: '/courses', label: 'Courses', icon: BookOpen },
        { to: '/teacher/dashboard', label: 'My Courses', icon: GraduationCap },
        { to: '/teacher/dashboard', label: 'Schedule', icon: CalendarDays, hash: '#schedule' },
      ]
    }
    return [
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    ]
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const roleBadge = (role) => {
    if (role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
          <GraduationCap size={10} />
          Teacher
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <BookOpen size={10} />
        Student
      </span>
    )
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-black ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-md shadow-black/5'
          : 'bg-white/80 backdrop-blur-md'
      }`}
      style={{
        borderBottom: scrolled
          ? '1px solid rgba(0, 0, 0, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-family-heading)]">
              <span className="text-slate-900">Skill</span>
              <span className="text-violet-700">Sphere</span>
            </span>
          </Link>

          
          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-1">
            {navLinks().map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-black hover:text-black hover:bg-slate-100'
                }`}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                )}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      profileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl p-1 animate-slide-down shadow-xl shadow-black/10 border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">{roleBadge(user.role)}</div>
                    </div>
                    <div className="p-1 mt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks().map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-black hover:text-black hover:bg-slate-100'
                }`}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <>
                <div className="border-t border-slate-100 my-2" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    {roleBadge(user.role)}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

