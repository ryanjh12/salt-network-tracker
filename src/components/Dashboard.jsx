import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getStatus } from '../data/phases'
import ChurchCard from './ChurchCard'
import AddChurchModal from './AddChurchModal'

const FILTERS = ['All', 'On Track', 'Needs Attention', 'Stalled', 'Discovery', 'Assimilation']

export default function Dashboard() {
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchChurches()
  }, [])

  async function fetchChurches() {
    setLoading(true)
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .order('last_activity_date', { ascending: false })
    if (!error) setChurches(data || [])
    setLoading(false)
  }

  const filtered = churches.filter((c) => {
    const status = getStatus(c.last_activity_date)
    const statusLabel = { on_track: 'On Track', needs_attention: 'Needs Attention', stalled: 'Stalled' }[status]
    const phaseLabel = c.current_phase === 'discovery' ? 'Discovery' : 'Assimilation'

    const matchesFilter =
      filter === 'All' ||
      filter === statusLabel ||
      filter === phaseLabel

    const term = search.toLowerCase()
    const matchesSearch =
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.lead_pastor.toLowerCase().includes(term)

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: churches.length,
    on_track: churches.filter((c) => getStatus(c.last_activity_date) === 'on_track').length,
    needs_attention: churches.filter((c) => getStatus(c.last_activity_date) === 'needs_attention').length,
    stalled: churches.filter((c) => getStatus(c.last_activity_date) === 'stalled').length,
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Churches" value={stats.total} color="blue" />
        <StatCard label="On Track" value={stats.on_track} color="lime" />
        <StatCard label="Needs Attention" value={stats.needs_attention} color="yellow" />
        <StatCard label="Stalled" value={stats.stalled} color="red" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#1e3a5f] text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search churches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 sm:w-56"
          />
          <button onClick={() => setShowAdd(true)} className="btn-primary whitespace-nowrap flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Church
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <svg className="animate-spin w-8 h-8 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading churches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-medium text-gray-500">No churches found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add a new church.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((church) => (
            <ChurchCard key={church.id} church={church} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddChurchModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            fetchChurches()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'border-l-[#2d5a8e] bg-white',
    lime: 'border-l-lime-500 bg-white',
    yellow: 'border-l-yellow-500 bg-white',
    red: 'border-l-red-500 bg-white',
  }
  const textColors = {
    blue: 'text-[#1e3a5f]',
    lime: 'text-lime-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  }
  return (
    <div className={`card border-l-4 ${colors[color]} p-4`}>
      <div className={`text-3xl font-bold ${textColors[color]}`}>{value}</div>
      <div className="text-xs font-semibold text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
