import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import CourseGrid from '../components/courses/CourseGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await api.get('/courses/enrolled/me')
        setCourses(res.data.data || res.data || [])
      } catch {
        setError('Failed to load your courses.')
      } finally {
        setLoading(false)
      }
    }
    fetchEnrolled()
  }, [])

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="mb-10 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-family-heading)] text-white">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span>
            </h1>
          </div>
        </div>
        <p className="text-slate-400 ml-[52px]">
          Continue where you left off. Your enrolled courses are below.
        </p>
      </div>

      {/* Enrolled courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-family-heading)] text-white flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-400" />
            My Courses
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your courses..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card p-12 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen size={36} className="text-indigo-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-family-heading)]">
              No courses yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              You haven't enrolled in any courses. Browse our catalog to find something that excites you!
            </p>
            <Link to="/courses">
              <Button size="md" className="group">
                Browse Courses
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        ) : (
          <CourseGrid courses={courses} />
        )}
      </section>
    </div>
  )
}
