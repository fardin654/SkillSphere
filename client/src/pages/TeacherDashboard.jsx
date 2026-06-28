import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import CourseGrid from '../components/courses/CourseGrid'
import SessionCard from '../components/sessions/SessionCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Plus,
  Sparkles,
  GraduationCap,
  CalendarDays,
  BookOpen,
  IndianRupee,
  ImageIcon,
  FileText,
  Type,
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
  })

  useEffect(() => {
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
  }, [])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Course title is required')
      return
    }
    setCreating(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : 0,
        thumbnailImage: formData.thumbnail || undefined,
      }
      const res = await api.post('/courses', payload)
      const newCourse = res.data.data || res.data
      setCourses((prev) => [newCourse, ...prev])
      setShowModal(false)
      setFormData({ title: '', description: '', price: '', thumbnail: '' })
      toast.success('Course created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading dashboard..." />

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="mb-10 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <GraduationCap size={18} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-family-heading)] text-white">
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Teacher'}</span>
          </h1>
        </div>
        <p className="text-slate-400 ml-[52px]">
          Manage your courses and upcoming sessions.
        </p>
      </div>

      {/* My Courses */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-family-heading)] text-white flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-400" />
            My Courses
          </h2>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Course
          </Button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card p-12 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen size={36} className="text-violet-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-family-heading)]">
              No courses yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Create your first course and start sharing your knowledge with students.
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Create Course
            </Button>
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
                <div className="glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300 group">
                  <div className="aspect-video overflow-hidden">
                    {course.thumbnailImage ? (
                      <img src={course.thumbnailImage} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center">
                        <BookOpen size={40} className="text-violet-400/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-semibold text-white line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
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
        <h2 className="text-xl font-semibold font-[family-name:var(--font-family-heading)] text-white flex items-center gap-2 mb-6">
          <CalendarDays size={20} className="text-emerald-400" />
          Upcoming Schedule
        </h2>

        {schedule.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <CalendarDays size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No upcoming sessions.</p>
            <p className="text-sm text-slate-500 mt-1">
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

      {/* Create Course Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Course">
        <form onSubmit={handleCreateCourse} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Course Title *
            </label>
            <div className="relative">
              <Type size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced React Patterns"
                className="input-dark pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will students learn?"
                rows={4}
                className="input-dark pl-10 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Price (₹)
              </label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0 for free"
                  className="input-dark pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Thumbnail URL
              </label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="input-dark pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={creating} className="flex-1">
              Create Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
