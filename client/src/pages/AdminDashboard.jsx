import { useState, useEffect } from 'react'
import {
  Check, X, ShieldAlert, BookOpen, MapPin, Phone, Calendar,
  PlusCircle, Pencil, LayoutGrid, Users, UserCheck, GraduationCap
} from 'lucide-react'
import api from '../api/axios'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AdminCourseForm from '../components/admin/AdminCourseForm'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [tab, setTab] = useState('approvals')
  const [teachers, setTeachers] = useState([])
  const [approvedTeachers, setApprovedTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Course form states
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const loadData = async () => {
    try {
      const [pendRes, courRes, apprRes, studRes] = await Promise.all([
        api.get('/admin/teachers/pending'),
        api.get('/courses'),
        api.get('/admin/teachers/approved'),
        api.get('/admin/students')
      ])
      setTeachers(pendRes.data.data || [])
      setCourses(courRes.data.data || [])
      setApprovedTeachers(apprRes.data.data || [])
      setStudents(studRes.data.data || [])
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/teachers/${id}/approve`)
      toast.success('Teacher approved successfully')
      await loadData()
    } catch (err) {
      toast.error('Failed to approve teacher')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return
    try {
      await api.put(`/admin/teachers/${id}/reject`)
      toast.success('Teacher application rejected')
      await loadData()
    } catch (err) {
      toast.error('Failed to reject teacher')
    }
  }

  const handleCourseSaved = async () => {
    setShowCourseForm(false)
    setEditingCourse(null)
    await loadData()
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setShowCourseForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." fullPage />
  }

  const tabs = [
    { id: 'courses', label: 'Manage Courses', icon: LayoutGrid, badge: courses.length },
    { id: 'teachers', label: 'Teachers', icon: UserCheck, badge: approvedTeachers.length },
    { id: 'students', label: 'Students', icon: GraduationCap, badge: students.length },
    { id: 'approvals', label: 'Teacher Approvals', icon: Users, badge: teachers.length },
  ]

  const getTeacherCourses = (teacherId) => {
    return courses.filter(c => 
      (c.educator && (c.educator._id === teacherId || c.educator === teacherId)) ||
      (c.instructors && c.instructors.some(i => (typeof i === 'object' ? i._id === teacherId : i === teacherId)))
    );
  }

  return (
    <div className="min-h-screen bg-white">
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-family-heading)] text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Manage teachers and courses from one place.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 max-w-6xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.id === 'approvals' && t.badge > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse"></span>
            )}
            <t.icon size={16} />
            {t.label}
            {t.badge > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      </div>

      {/* ─────── APPROVALS TAB ─────── */}
      {tab === 'approvals' && (
        <>
          {teachers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-6xl mx-auto">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
              <p className="text-slate-500">There are no pending teacher applications to review at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="bg-white max-w-6xl mx-auto border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                        <p className="text-sm text-slate-500">{teacher.email}</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Phone Number</p>
                        <p className="text-sm text-slate-900">{teacher.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">State</p>
                        <p className="text-sm text-slate-900">{teacher.state || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</p>
                        <p className="text-sm text-slate-900">
                          {teacher.dob ? new Date(teacher.dob).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Intended Course</p>
                        <p className="text-sm font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-0.5 border border-indigo-100">
                          {teacher.intendedCourse ? teacher.intendedCourse.title : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(teacher._id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                    >
                      <Check size={18} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(teacher._id)}
                      variant="secondary"
                      className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <X size={18} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─────── COURSES TAB ─────── */}
      {tab === 'courses' && (
        <>
          {showCourseForm ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <AdminCourseForm
                course={editingCourse}
                onSaved={handleCourseSaved}
                onCancel={() => { setShowCourseForm(false); setEditingCourse(null) }}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6 max-w-6xl mx-auto">
                <Button onClick={() => { setEditingCourse(null); setShowCourseForm(true) }}>
                  <PlusCircle size={18} className="mr-2" />
                  New Course
                </Button>
              </div>

              {courses.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-6xl mx-auto">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Courses Yet</h3>
                  <p className="text-slate-500 mb-4">Create your first course to get started.</p>
                  <Button onClick={() => setShowCourseForm(true)}>
                    <PlusCircle size={16} className="mr-2" />
                    Create Course
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {courses.map((c) => (
                    <div key={c._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-indigo-50 to-violet-50 relative overflow-hidden">
                        {c.thumbnailImage ? (
                          <img src={c.thumbnailImage} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={40} className="text-indigo-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            c.isActive
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-1">{c.title}</h3>
                        {c.instructors && c.instructors.length > 0 && (
                          <p className="text-xs text-slate-500 mb-2">
                            {c.instructors.map((i) => (typeof i === 'object' ? i.name : i)).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold text-indigo-600">
                            {c.currency === 'USD' ? '$' : '₹'}{c.price > 0 ? (c.price / 100).toFixed(0) : 'Free'}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEdit(c)}
                            className="text-xs"
                          >
                            <Pencil size={14} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─────── TEACHERS TAB ─────── */}
      {tab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {approvedTeachers.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
               <p className="text-slate-500">No approved teachers found.</p>
            </div>
          ) : (
            approvedTeachers.map(teacher => {
              const teacherCourses = getTeacherCourses(teacher._id)
              return (
                <div key={teacher._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{teacher.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Assigned Courses ({teacherCourses.length}):</h4>
                    {teacherCourses.length > 0 ? (
                      <ul className="space-y-1">
                        {teacherCourses.map(c => (
                          <li key={c._id} className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg truncate">
                            <BookOpen size={14} className="shrink-0" />
                            <span className="truncate">{c.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No courses assigned yet.</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ─────── STUDENTS TAB ─────── */}
      {tab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-w-6xl mx-auto overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center">
               <p className="text-slate-500">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Enrolled Courses</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.enrolledCourses.map(course => (
                              <span
                                key={course._id}
                                className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                              >
                                {course.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not enrolled in any course</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
