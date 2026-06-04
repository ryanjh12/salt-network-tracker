import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, PHASE_ORDER } from '../data/phases'

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function AddChurchModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: 'TX',
    lead_pastor: '',
    contact_email: '',
    current_phase: 'discovery',
    current_step: 0,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const phase = PHASES[form.current_phase]

  async function handleSave() {
    if (!form.name.trim() || !form.city.trim() || !form.lead_pastor.trim()) {
      setError('Church name, city, and lead pastor are required.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('churches').insert({
      ...form,
      other_key_leaders: [],
      last_activity_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1e3a5f]">Add New Church</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label">Church Name *</label>
            <input className="input" placeholder="First Baptist Church" value={form.name} onChange={set('name')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City *</label>
              <input className="input" placeholder="Austin" value={form.city} onChange={set('city')} />
            </div>
            <div>
              <label className="label">State *</label>
              <select className="input" value={form.state} onChange={set('state')}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Lead Pastor *</label>
            <input className="input" placeholder="Pastor John Smith" value={form.lead_pastor} onChange={set('lead_pastor')} />
          </div>

          <div>
            <label className="label">Contact Email</label>
            <input type="email" className="input" placeholder="pastor@church.org" value={form.contact_email} onChange={set('contact_email')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Starting Phase</label>
              <select
                className="input"
                value={form.current_phase}
                onChange={(e) => setForm({ ...form, current_phase: e.target.value, current_step: 0 })}
              >
                {PHASE_ORDER.map((p) => (
                  <option key={p} value={p}>{PHASES[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Starting Step</label>
              <select className="input" value={form.current_step} onChange={(e) => setForm({ ...form, current_step: parseInt(e.target.value) })}>
                {phase.steps.map((step, i) => (
                  <option key={i} value={i}>{i + 1}. {step}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[72px]" placeholder="Any initial context about this church…" value={form.notes} onChange={set('notes')} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Adding…' : 'Add Church'}
          </button>
        </div>
      </div>
    </div>
  )
}
