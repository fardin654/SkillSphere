import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IndianRupee, DollarSign, Users, BookOpen, ArrowLeft,
  CheckCircle2, Clock, Calendar, BarChart3, Globe, Tag
} from 'lucide-react'
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
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Courses
        </Button>
      </div>
    )
  }
  if (!course) return null

  const displayPrice = course.price != null ? (course.price / 100).toFixed(0) : 'Free'
  const currencySymbol = course.currency === 'USD' ? '$' : '₹'
  const CurrencyIcon = course.currency === 'USD' ? DollarSign : IndianRupee

  // Resolve instructor names
  const instructorNames =
    course.instructors && course.instructors.length > 0
      ? course.instructors.map((i) => (typeof i === 'object' ? i.name : i))
      : course.educator
        ? [typeof course.educator === 'object' ? course.educator.name : course.educator]
        : ['Instructor']

  const details = course.courseDetails || {}

  return (
    <div className="page-enter bg-slate-50 min-h-screen">
      {/* ── Hero Section ─────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Title & Intro — 2 cols */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 leading-tight">
                {course.title}
              </h1>

              {course.introduction && (
                <p className="text-lg text-slate-600 mt-4 leading-relaxed">
                  {course.introduction}
                </p>
              )}

              {/* Instructors */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-2">
                  {instructorNames.slice(0, 3).map((name, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white"
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Taught by: {instructorNames.join(', ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {instructorNames.length > 1 ? `${instructorNames.length} instructors` : 'Instructor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Price & Action Card — 1 col */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 sticky top-24 space-y-5">
                {/* Price */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-4xl font-bold text-slate-900 mb-1">
                    {course.price > 0 ? (
                      <>
                        <CurrencyIcon size={28} />
                        <span>{displayPrice}</span>
                      </>
                    ) : (
                      <span className="text-emerald-600">Free</span>
                    )}
                  </div>
                  {course.price > 0 && (
                    <p className="text-xs text-slate-500">One-time payment</p>
                  )}
                </div>

                <div className="border-t border-slate-100" />

                {/* Action button */}
                {isEnrolled ? (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => navigate(`/dashboard/course/${id}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                  >
                    <CheckCircle2 size={18} />
                    Go to Course
                  </Button>
                ) : user?.role === 'teacher' || user?.role === 'admin' ? (
                  <p className="text-center text-sm text-slate-400">
                    Viewing as {user.role}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Body ─────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content — 2 cols */}
          <div className="lg:col-span-2 space-y-8">

            {/* At a Glance — Course Details Grid */}
            {(details.totalSessions || details.duration || details.skillLevel || details.language || (details.batchTypes && details.batchTypes.length > 0)) && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 mb-5">
                  At a Glance
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {details.totalSessions && (
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                      <Calendar size={20} className="text-indigo-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{details.totalSessions}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Sessions</p>
                    </div>
                  )}
                  {details.duration && (
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                      <Clock size={20} className="text-violet-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-slate-900">{details.duration}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Duration</p>
                    </div>
                  )}
                  {details.skillLevel && (
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                      <BarChart3 size={20} className="text-emerald-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-slate-900">{details.skillLevel}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Level</p>
                    </div>
                  )}
                  {details.language && (
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                      <Globe size={20} className="text-sky-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-slate-900">{details.language}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Language</p>
                    </div>
                  )}
                </div>

                {/* Batch Types */}
                {details.batchTypes && details.batchTypes.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Available Batches</p>
                    <div className="flex flex-wrap gap-2">
                      {details.batchTypes.map((bt) => (
                        <span
                          key={bt}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          <Tag size={12} />
                          {bt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* About This Course */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 mb-4">
                About This Course
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {course.description || 'No description provided.'}
              </p>
            </section>

            {/* What You Will Receive */}
            {course.whatYouWillReceive && course.whatYouWillReceive.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 mb-5">
                  What You Will Receive
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouWillReceive.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
                    >
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — 1 col (Thumbnail + Instructors recap) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thumbnail */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {course.thumbnailImage ? (
                <img
                  src={course.thumbnailImage}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                  <BookOpen size={48} className="text-indigo-300" />
                </div>
              )}
            </div>

            {/* Instructors box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                Instructors
              </h3>
              <div className="space-y-3">
                {instructorNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">Instructor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
