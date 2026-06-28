import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, BookOpen, Users, Radio, Zap } from 'lucide-react'
import api from '../api/axios'
import CourseGrid from '../components/courses/CourseGrid'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function HomePage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses')
        setCourses(res.data.data || res.data || [])
      } catch (err) {
        setError('Failed to load courses. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { icon: BookOpen, label: 'Courses', value: `${courses.length}+` },
    { icon: Users, label: 'Expert Teachers', value: 'Top-tier' },
    { icon: Radio, label: 'Live Classes', value: 'Real-time' },
    { icon: Zap, label: 'Instant Access', value: 'Always' },
  ]

  return (
    <div className="page-enter bg-slate-50 text-slate-900 min-h-screen">
      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Floating orbs */}
        <div className="orb orb-primary w-[600px] h-[600px] -top-40 -left-40 animate-float-slow" />
        <div className="orb orb-secondary w-[500px] h-[500px] -bottom-20 -right-32 animate-float" />
        <div className="orb orb-accent w-[300px] h-[300px] top-1/3 right-1/4 animate-float-slow" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] display-flex z-0"
          style={{
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 lg:py-0">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-sm text-indigo-900 mb-8 animate-slide-down shadow-sm">
                <Zap size={14} className="text-amber-500 font-bold" />
                <span className="font-bold">Powered by live, interactive learning</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-[family-name:var(--font-family-heading)] leading-tight mb-6 animate-slide-up">
                <span className="gradient-text-hero">Learn Without</span>
                <br />
                <span className="text-slate-900">Limits</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-10 animate-slide-up opacity-0" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                Explore expert-led courses with live sessions, interactive content, and a
                community that empowers you to grow. Start your journey today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                <a href="#courses">
                  <Button size="lg" className="group">
                    Browse Courses
                    <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </a>
                <Link to="/register">
                  <Button variant="secondary" size="lg">
                    Get Started Free
                    <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src="/images/hero.png"
                alt="SkillSphere learning experience"
                className="w-full max-w-md rounded-3xl shadow-2xl border border-white/60 object-cover"
              />
            </div>
          </div>
        </div>

      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="relative py-8 border-y border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 justify-center animate-slide-up opacity-0"
                style={{ animationDelay: `${i * 100 + 400}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <stat.icon size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Course Catalog ═══ */}
      <section id="courses" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 mb-3">
              Explore Our <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Hand-picked courses from industry experts, designed to take your skills to the next level.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ml-0.5" />
              <input
                type="text"
                placeholder="   Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pl-11 py-3 rounded-xl shadow-sm"
              />
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <LoadingSpinner text="Loading courses..." />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <CourseGrid
              courses={filteredCourses}
              emptyMessage={
                searchQuery
                  ? `No courses matching "${searchQuery}"`
                  : 'No courses available yet'
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}
