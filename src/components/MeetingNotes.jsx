import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function MeetingNotes({ churchId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), title: '', body: '', transcript_url: '' })
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [churchId])

  async function fetchNotes() {
    setLoading(true)
    const { data } = await supabase
      .from('meeting_notes')
      .select('*')
      .eq('church_id', churchId)
      .order('date', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function saveNote() {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('meeting_notes').insert({
      church_id: churchId,
      date: form.date,
      title: form.title,
      body: form.body || null,
      transcript_url: form.transcript_url || null,
    })
    await supabase
      .from('churches')
      .update({ last_activity_date: new Date(form.date).toISOString(), updated_at: new Date().toISOString() })
      .eq('id', churchId)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), title: '', body: '', transcript_url: '' })
    setShowForm(false)
    fetchNotes()
    setSaving(false)
  }

  async function deleteNote(noteId) {
    setDeletingId(noteId)
    await supabase.from('meeting_notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    setDeletingId(null)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading notes…</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#1e3a5f]">Meeting Notes</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Note
        </button>
      </div>

      {showForm && (
        <div className="card p-5 border-l-4 border-l-lime-400">
          <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">New Meeting Note</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" className="input" placeholder="e.g. Discovery Call #1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input min-h-[100px]" placeholder="Meeting notes, key decisions, action items…" value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
            </div>
            <div>
              <label className="label">Gemini Transcript Link (Google Meet)</label>
              <input type="url" className="input" placeholder="https://meet.google.com/…" value={form.transcript_url} onChange={e => setForm({...form, transcript_url: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveNote} disabled={saving || !form.title.trim()} className="btn-primary">
                {saving ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm ? (
        <div className="card p-12 text-center text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="font-medium text-gray-500">No meeting notes yet</p>
          <p className="text-sm mt-1">Add your first note to start tracking conversations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const isExpanded = expandedId === note.id
            return (
              <div key={note.id} className="card border border-gray-100">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 text-xs font-bold leading-tight">
                      <div className="text-center">
                        <div>{format(new Date(note.date + 'T00:00:00'), 'MMM').toUpperCase()}</div>
                        <div className="text-sm font-black">{format(new Date(note.date + 'T00:00:00'), 'd')}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{note.title}</div>
                      {note.body && !isExpanded && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{note.body}</div>
                      )}
                      {note.transcript_url && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-lime-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                          </svg>
                          <span className="text-xs text-lime-600 font-medium">Transcript linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    {note.body && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{note.body}</p>
                    )}
                    {note.transcript_url && (
                      <a
                        href={note.transcript_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white bg-[#1e3a5f] hover:bg-[#2d5a8e] px-3 py-2 rounded-lg font-medium transition-colors mb-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                        </svg>
                        View Gemini Transcript
                      </a>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteNote(note.id)}
                        disabled={deletingId === note.id}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === note.id ? 'Deleting…' : 'Delete Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
