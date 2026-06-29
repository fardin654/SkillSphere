import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import SessionCard from '../components/sessions/SessionCard'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  GraduationCap,
  CalendarDays,
  BookOpen,
  IndianRupee,
  Clock,
  ShieldAlert,
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isPending = user?.approvalStatus !== 'approved'

  useEffect(() => {
    if (isPending) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [coursesRes, scheduleRes] = await Promise.allSettled([
          api.get('/courses/teacher/me'),
          api.get('/sessions/teacher/schedule'),
        ])

        if (coursesRes.status === 'fulfilled') {
          setCourses(coursesRes.value.data.data || coursesRes.value.data || [])
        }
        if (scheduleRes.status === 'fulfilled') {
          setSchedule(scheduleRes.value.data.data || scheduleRes.value.data || [])
        }
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isPending])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />

  return (
    <div className="page-enter bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <GraduationCap size={18} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900">
              Welcome, <span className="text-violet-600">{user?.name?.split(' ')[0] || 'Teacher'}</span>
            </h1>
          </div>
          <p className="text-slate-500 ml-[52px]">
            {isPending
              ? 'Your account is awaiting admin approval.'
              : 'Manage your courses and upcoming sessions.'}
          </p>
        </div>

        {/* ── Pending Approval Banner ─────────────── */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Clock size={36} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-family-heading)]">
              Approval Pending
            </h2>
            <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
              Your teacher account is currently under review by an administrator. 
              Once approved, you'll be able to view your assigned courses and upcoming class schedule here.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
              <ShieldAlert size={16} />
              Status: {user?.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
            </div>
          </div>
        )}

        {/* ── Approved Content ─────────────────────── */}
        {!isPending && (
          <>
            {/* My Courses */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold font-[family-name:var(--font-family-heading)] text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  My Courses
                </h2>
              </div>

              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm animate-scale-in">
                  <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
                    <BookOpen size={36} className="text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 font-[family-name:var(--font-family-heading)]">
                    No courses assigned yet
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    An administrator will assign courses to you. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, index) => (
                    <Link
                      key={course._id}
                      to={`/teacher/course/${course._id}`}
                      className="animate-slide-up opacity-0"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="aspect-video overflow-hidden">
                          {course.thumbnailImage ? (
                            <img src={course.thumbnailImage} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                              <BookOpen size={40} className="text-violet-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-violet-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                            <IndianRupee size={12} />
                            {course.price ? (course.price / 100).toFixed(0) : 'Free'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Schedule */}
            <section id="schedule">
              <h2 className="text-xl font-semibold font-[family-name:var(--font-family-heading)] text-slate-900 flex items-center gap-2 mb-6">
                <CalendarDays size={20} className="text-emerald-600" />
                Upcoming Schedule
              </h2>

              {schedule.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                  <CalendarDays size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No upcoming sessions.</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Add sessions to your courses to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule.map((session, i) => (
                    <div
                      key={session._id}
                      className="animate-slide-up opacity-0"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
                    >
                      <SessionCard session={session} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
