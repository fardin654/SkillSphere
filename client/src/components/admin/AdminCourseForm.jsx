import { useState, useEffect } from 'react'
import { X, Plus, Save, BookOpen, Users, DollarSign, ListChecks, Settings2, Tag } from 'lucide-react'
import api from '../../api/axios'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function AdminCourseForm({ course, onSaved, onCancel }) {
  const isEditing = !!course

  // Basic fields
  const [title, setTitle] = useState(course?.title || '')
  const [description, setDescription] = useState(course?.description || '')
  const [introduction, setIntroduction] = useState(course?.introduction || '')
  const [price, setPrice] = useState(course?.price ?? '')
  const [currency, setCurrency] = useState(course?.currency || 'INR')
  const [thumbnailImage, setThumbnailImage] = useState(course?.thumbnailImage || '')

  // Instructors
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [selectedInstructors, setSelectedInstructors] = useState(
    course?.instructors?.map((i) => (typeof i === 'object' ? i._id : i)) || []
  )

  // Course details
  const [totalSessions, setTotalSessions] = useState(course?.courseDetails?.totalSessions || '')
  const [duration, setDuration] = useState(course?.courseDetails?.duration || '')
  const [skillLevel, setSkillLevel] = useState(course?.courseDetails?.skillLevel || '')
  const [language, setLanguage] = useState(course?.courseDetails?.language || 'English')

  // Dynamic arrays
  const [batchTypes, setBatchTypes] = useState(course?.courseDetails?.batchTypes || [])
  const [batchInput, setBatchInput] = useState('')
  const [deliverables, setDeliverables] = useState(course?.whatYouWillReceive || [])
  const [deliverableInput, setDeliverableInput] = useState('')

  const [saving, setSaving] = useState(false)

  // Fetch approved teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/admin/teachers/approved')
        setAvailableTeachers(res.data.data || [])
      } catch {
        console.error('Failed to load teachers')
      }
    }
    fetchTeachers()
  }, [])

  const toggleInstructor = (id) => {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const addBatchType = () => {
    const val = batchInput.trim()
    if (val && !batchTypes.includes(val)) {
      setBatchTypes((prev) => [...prev, val])
    }
    setBatchInput('')
  }

  const removeBatchType = (val) => {
    setBatchTypes((prev) => prev.filter((b) => b !== val))
  }

  const addDeliverable = () => {
    const val = deliverableInput.trim()
    if (val && !deliverables.includes(val)) {
      setDeliverables((prev) => [...prev, val])
    }
    setDeliverableInput('')
  }

  const removeDeliverable = (val) => {
    setDeliverables((prev) => prev.filter((d) => d !== val))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || price === '') {
      toast.error('Title, description, and price are required')
      return
    }

    const payload = {
      title,
      description,
      introduction,
      price: Number(price),
      currency,
      thumbnailImage,
      instructors: selectedInstructors,
      courseDetails: {
        batchTypes,
        totalSessions: totalSessions ? Number(totalSessions) : undefined,
        duration,
        skillLevel: skillLevel || undefined,
        language,
      },
      whatYouWillReceive: deliverables,
    }

    setSaving(true)
    try {
      if (isEditing) {
        await api.put(`/courses/${course._id}`, payload)
        toast.success('Course updated successfully')
      } else {
        await api.post('/courses', payload)
        toast.success('Course created successfully')
      }
      onSaved?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all py-2.5 px-3.5 rounded-xl text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic Info ─────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-600" />
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Introduction</label>
            <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} placeholder="Brief overview paragraph..." rows={3} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed course description..." rows={5} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Thumbnail Image URL</label>
            <input type="url" value={thumbnailImage} onChange={(e) => setThumbnailImage(e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
        </div>
      </section>

      {/* ── Price ───────────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-indigo-600" />
          Pricing
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Price (in paise/cents) *</label>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 49900" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Instructors ─────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-indigo-600" />
          Instructors
        </h3>
        {availableTeachers.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No approved teachers available. Approve teachers first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTeachers.map((teacher) => {
              const isSelected = selectedInstructors.includes(teacher._id)
              return (
                <button
                  key={teacher._id}
                  type="button"
                  onClick={() => toggleInstructor(teacher._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left text-sm ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{teacher.name}</p>
                    <p className="text-xs text-slate-500 truncate">{teacher.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Course Details ──────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Settings2 size={18} className="text-indigo-600" />
          Course Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Total Sessions</label>
            <input type="number" min="1" value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} placeholder="e.g. 24" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Duration</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 12 Weeks" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Skill Level</label>
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={inputClass}>
              <option value="">Select level...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Language</label>
            <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English" className={inputClass} />
          </div>
        </div>

        {/* Batch Types — dynamic chips */}
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Batch Types</label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBatchType() } }}
              placeholder="e.g. Weekend"
              className={`${inputClass} flex-1`}
            />
            <Button type="button" onClick={addBatchType} className="shrink-0 px-4">
              <Plus size={16} />
              Add
            </Button>
          </div>
          {batchTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {batchTypes.map((bt) => (
                <span key={bt} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Tag size={12} />
                  {bt}
                  <button type="button" onClick={() => removeBatchType(bt)} className="ml-1 text-indigo-400 hover:text-indigo-700">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Deliverables ────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-indigo-600" />
          What You Will Receive
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={deliverableInput}
            onChange={(e) => setDeliverableInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable() } }}
            placeholder="e.g. Certificate of Completion"
            className={`${inputClass} flex-1`}
          />
          <Button type="button" onClick={addDeliverable} className="shrink-0 px-4">
            <Plus size={16} />
            Add
          </Button>
        </div>
        {deliverables.length > 0 && (
          <div className="space-y-2 mt-3">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <svg className="shrink-0 w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                <span className="flex-1 text-sm text-slate-800">{d}</span>
                <button type="button" onClick={() => removeDeliverable(d)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
          <Save size={16} />
          {isEditing ? 'Update Course' : 'Create Course'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
