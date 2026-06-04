import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PHASES, PHASE_ORDER, getStatus, STATUS_CONFIG } from '../data/phases'
import { formatDistanceToNow, format } from 'date-fns'
import StepTracker from './StepTracker'
import MeetingNotes from './MeetingNotes'
import StepHistory from './StepHistory'

export default function ChurchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [church, setChurch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('progress')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [advanceNote, setAdvanceNote] = useState('')
  const [advanceDate, setAdvanceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [advancing, setAdvancing] = useState(false)
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    fetchChurch()
  }, [id])

  async function fetchChurch() {
    setLoading(true)
    const { data, error } = await supabase.from('churches').select('*').eq('id', id).single()
    if (error || !data) { navigate('/'); return }
    setChurch(data)
    setEditForm(data)
    setLeaders(data.other_key_leaders || [])
    setLoading(false)
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase
      .from('churches')
      .update({ ...editForm, other_key_leaders: leaders, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) { setChurch({ ...editForm, other_key_leaders: leaders }); setEditing(false) }
    setSaving(false)
  }

  async function advanceStep() {
    if (!church) return
    setAdvancing(true)
    const phase = PHASES[church.current_phase]
    const isLastStep = church.current_step >= phase.steps.length - 1
    const isLastPhase = church.current_phase === PHASE_ORDER[PHASE_ORDER.length - 1]

    let newPhase = church.current_phase
    let newStep = church.current_step

    if (isLastStep && !isLastPhase) {
      const nextPhaseIdx = PHASE_ORDER.indexOf(church.current_phase) + 1
      newPhase = PHASE_ORDER[nextPhaseIdx]
      newStep = 0
    } else if (!isLastStep) {
      newStep = church.current_step + 1
    }

    const stepName = PHASES[church.current_phase].steps[church.current_step]

    await supabase.from('step_history').insert({
      church_id: id,
      phase: church.current_phase,
      step_index: church.current_step,
      step_name: stepName,
      completed_at: new Date(advanceDate).toISOString(),
      note: advanceNote || null,
    })

    await supabase
      .from('churches')
      .update({
        current_phase: newPhase,
        current_step: newStep,
        last_activity_date: new Date(advanceDate).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    setAdvanceNote('')
    setAdvanceDate(format(new Date(), 'yyyy-MM-dd'))
    fetchChurch()
    setAdvancing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <svg className="animate-spin w-7 h-7 mr-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading…
      </div>
    )
  }

  const status = getStatus(church.last_activity_date)
  const statusCfg = STATUS_CONFIG[status]
  const phase = PHASES[church.current_phase]
  const isComplete = church.current_phase === PHASE_ORDER[PHASE_ORDER.length - 1] && church.current_step >= PHASES[church.current_phase].steps.length - 1

  const tabs = [
    { id: 'progress', label: 'Step Progress' },
    { id: 'history', label: 'Step History' },
    { id: 'notes', label: 'Meeting Notes' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            {editing ? (
              <input
                className="input text-2xl font-bold mb-1 text-[#1e3a5f]"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            ) : (
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">{church.name}</h1>
            )}
            <p className="text-gray-500 text-sm">
              {editing ? (
                <span className="flex gap-2">
                  <input className="input" style={{width:'120px'}} placeholder="City" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                  <input className="input" style={{width:'80px'}} placeholder="State" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                </span>
              ) : (
                `${church.city}, ${church.state}`
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
          <InfoField
            label="Lead Pastor"
            editing={editing}
            value={editing ? editForm.lead_pastor : church.lead_pastor}
            onChange={(v) => setEditForm({ ...editForm, lead_pastor: v })}
          />
          <InfoField
            label="Contact Email"
            editing={editing}
            value={editing ? editForm.contact_email : church.contact_email}
            onChange={(v) => setEditForm({ ...editForm, contact_email: v })}
            type="email"
          />
        </div>

        {/* Other key leaders */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="label">Other Key Leaders</div>
          {editing ? (
            <div className="space-y-2">
              {leaders.map((l, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="input" placeholder="Name" value={l.name} onChange={e => {
                    const updated = [...leaders]; updated[i] = { ...l, name: e.target.value }; setLeaders(updated)
                  }} />
                  <input className="input" placeholder="Email" value={l.email} onChange={e => {
                    const updated = [...leaders]; updated[i] = { ...l, email: e.target.value }; setLeaders(updated)
                  }} />
                  <button onClick={() => setLeaders(leaders.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button onClick={() => setLeaders([...leaders, { name: '', email: '' }])} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                + Add Leader
              </button>
            </div>
          ) : (
            church.other_key_leaders?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {church.other_key_leaders.map((l, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 border border-gray-100">
                    <div className="text-sm font-semibold text-gray-700">{l.name}</div>
                    {l.email && <div className="text-xs text-gray-500">{l.email}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">—</span>
            )
          )}
        </div>

        {/* Notes */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="label">Church Notes</div>
          {editing ? (
            <textarea
              className="input min-h-[80px]"
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="General notes about this church…"
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{church.notes || <span className="text-gray-400">—</span>}</p>
          )}
        </div>

        {/* Phase summary */}
        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-4">
          <div>
            <div className="label">Current Phase</div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-lg ${
              church.current_phase === 'discovery' ? 'bg-blue-100 text-blue-700' : 'bg-lime-100 text-lime-700'
            }`}>
              {phase?.label}
            </span>
          </div>
          <div>
            <div className="label">Current Step</div>
            <div className="text-sm font-semibold text-gray-700">
              {church.current_step + 1} / {phase?.steps.length} — {phase?.steps[church.current_step]}
            </div>
          </div>
          <div>
            <div className="label">Last Activity</div>
            <div className="text-sm text-gray-600">
              {church.last_activity_date
                ? formatDistanceToNow(new Date(church.last_activity_date), { addSuffix: true })
                : 'Never'}
            </div>
          </div>
        </div>

        {/* Advance step */}
        {!isComplete && !editing && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="label mb-2">Advance to Next Step</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                className="input sm:w-44"
                value={advanceDate}
                onChange={(e) => setAdvanceDate(e.target.value)}
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="Optional note…"
                value={advanceNote}
                onChange={(e) => setAdvanceNote(e.target.value)}
              />
              <button onClick={advanceStep} disabled={advancing} className="btn-primary whitespace-nowrap flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {advancing ? 'Advancing…' : 'Mark Complete & Advance'}
              </button>
            </div>
          </div>
        )}
        {isComplete && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-lime-600 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Onboarding Complete!
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-[#1e3a5f] text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'progress' && <StepTracker church={church} />}
      {activeTab === 'history' && <StepHistory churchId={id} />}
      {activeTab === 'notes' && <MeetingNotes churchId={id} />}
    </div>
  )
}

function InfoField({ label, value, editing, onChange, type = 'text' }) {
  return (
    <div>
      <div className="label">{label}</div>
      {editing ? (
        <input type={type} className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="text-sm text-gray-700 font-medium">{value || <span className="text-gray-400">—</span>}</div>
      )}
    </div>
  )
}
