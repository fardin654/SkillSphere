import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, Lock, Eye, EyeOff, User, BookOpen, GraduationCap, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, googleLogin, isAuthenticated, user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const dest = user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'
    navigate(dest, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const userData = await register(name, email, password, role)
      const dest = userData.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'
      navigate(dest)
    } catch {
      // toast handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const userData = await googleLogin(credentialResponse.credential)
      const dest = userData.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'
      navigate(dest)
    } catch {
      // toast handled in context
    }
  }

  const roles = [
    {
      value: 'student',
      icon: BookOpen,
      title: 'I want to learn',
      desc: 'Enroll in courses and attend live classes',
    },
    {
      value: 'teacher',
      icon: GraduationCap,
      title: 'I want to teach',
      desc: 'Create courses and schedule live sessions',
    },
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 page-enter relative">
      {/* Background orbs */}
      <div className="orb orb-primary w-[400px] h-[400px] -top-20 -right-20 animate-float-slow" />
      <div className="orb orb-accent w-[300px] h-[300px] -bottom-10 -left-16 animate-float" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-strong p-8 gradient-border animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-family-heading)] text-white">
              Create your account
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Join SkillSphere and start your journey
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                  role === r.value
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-white/3 border-white/5 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <r.icon
                  size={20}
                  className={role === r.value ? 'text-indigo-400' : 'text-slate-500'}
                />
                <p
                  className={`text-sm font-semibold mt-2 ${
                    role === r.value ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {r.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="input-dark pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-dark pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input-dark pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed')}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signup_with"
            />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
