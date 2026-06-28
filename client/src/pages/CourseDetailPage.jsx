import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IndianRupee, User, BookOpen, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`)
        const courseData = res.data.data || res.data
        setCourse(courseData)

        // Check enrollment if student
        if (isAuthenticated && user?.role === 'student') {
          try {
            const enrolledRes = await api.get('/courses/enrolled/me')
            const enrolled = enrolledRes.data.data || enrolledRes.data || []
            setIsEnrolled(enrolled.some((c) => c._id === id))
          } catch {
            // Ignore — might not be enrolled
          }
        }
      } catch {
        setError('Course not found or failed to load.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id, isAuthenticated, user])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'student') {
      toast.error('Only students can enroll in courses')
      return
    }

    setEnrolling(true)
    try {
      const res = await api.post('/payments/create-checkout-session', { courseId: id })
      const checkoutData = res.data.data || res.data
      const url = checkoutData.url || checkoutData.sessionUrl
      window.location.href = url
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading course..." />
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center page-enter">
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Courses
        </Button>
      </div>
    )
  }
  if (!course) return null

  const displayPrice = course.price != null ? (course.price / 100).toFixed(0) : 'Free'
  const educatorName =
    typeof course.educator === 'object' ? course.educator.name : course.educator || 'Instructor'

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main content — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden glass-card">
            {course.thumbnailImage ? (
              <img
                src={course.thumbnailImage}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-violet-600/20 flex items-center justify-center">
                <BookOpen size={64} className="text-indigo-400/40" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-family-heading)] text-white leading-tight">
              {course.title}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                {educatorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{educatorName}</p>
                <p className="text-xs text-slate-500">Instructor</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-family-heading)] text-white mb-3">
              About this Course
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {course.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Sidebar — 2 cols */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 sticky top-24 space-y-6">
            {/* Price */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-4xl font-bold text-white mb-1">
                {course.price > 0 ? (
                  <>
                    <IndianRupee size={28} />
                    <span>{displayPrice}</span>
                  </>
                ) : (
                  <span className="text-emerald-400">Free</span>
                )}
              </div>
              {course.price > 0 && (
                <p className="text-xs text-slate-500">One-time payment</p>
              )}
            </div>

            <div className="border-t border-white/5" />

            {/* Action button */}
            {isEnrolled ? (
              <Button
                variant="accent"
                fullWidth
                size="lg"
                onClick={() => navigate(`/dashboard/course/${id}`)}
              >
                <CheckCircle2 size={18} />
                Go to Course
              </Button>
            ) : user?.role === 'teacher' ? (
              <p className="text-center text-sm text-slate-400">
                Viewing as teacher
              </p>
            ) : (
              <Button
                fullWidth
                size="lg"
                loading={enrolling}
                onClick={handleEnroll}
              >
                {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
              </Button>
            )}

            {/* Features */}
            <div className="space-y-3 text-sm text-slate-400">
              {[
                'Live interactive sessions',
                'Access to course materials',
                'Direct educator support',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
