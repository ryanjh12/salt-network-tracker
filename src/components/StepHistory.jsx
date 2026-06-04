import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { PHASES } from '../data/phases'

export default function StepHistory({ churchId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [churchId])

  async function fetchHistory() {
    setLoading(true)
    const { data } = await supabase
      .from('step_history')
      .select('*')
      .eq('church_id', churchId)
      .order('completed_at', { ascending: false })
    setHistory(data || [])
    setLoading(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading history…</div>

  if (history.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-medium text-gray-500">No step history yet</p>
        <p className="text-sm mt-1">Completed steps will appear here.</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold text-[#1e3a5f] mb-4">Step Completion Log</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-4">
          {history.map((item) => {
            const phase = PHASES[item.phase]
            return (
              <div key={item.id} className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-gray-100 mb-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.step_name}</div>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                        item.phase === 'discovery' ? 'bg-blue-100 text-blue-600' : 'bg-lime-100 text-lime-600'
                      }`}>
                        {phase?.label} · Step {item.step_index + 1}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {format(new Date(item.completed_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">{item.note}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
