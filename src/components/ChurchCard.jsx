import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { PHASES, getStatus, STATUS_CONFIG } from '../data/phases'

export default function ChurchCard({ church }) {
  const navigate = useNavigate()
  const status = getStatus(church.last_activity_date)
  const statusCfg = STATUS_CONFIG[status]
  const phase = PHASES[church.current_phase]
  const stepName = phase?.steps[church.current_step] ?? '—'
  const stepNum = church.current_step + 1
  const totalSteps = phase?.steps.length ?? 1
  const progress = Math.round((church.current_step / totalSteps) * 100)

  const lastActivity = church.last_activity_date
    ? formatDistanceToNow(new Date(church.last_activity_date), { addSuffix: true })
    : 'Never'

  return (
    <div
      onClick={() => navigate(`/church/${church.id}`)}
      className="card p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 border border-gray-100 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-[#1e3a5f] text-base group-hover:text-blue-700 transition-colors leading-tight">
            {church.name}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            {church.city}, {church.state}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text} shrink-0 ml-2`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Pastor */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {church.lead_pastor?.charAt(0) ?? '?'}
        </div>
        <span className="text-sm text-gray-700 font-medium truncate">{church.lead_pastor}</span>
      </div>

      {/* Phase badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          church.current_phase === 'discovery'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-lime-100 text-lime-700'
        }`}>
          {phase?.label}
        </span>
        <span className="text-xs text-gray-400">{phase?.duration}</span>
      </div>

      {/* Current step */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium truncate pr-2">Step {stepNum}/{totalSteps}: {stepName}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${church.current_phase === 'discovery' ? 'bg-[#2d5a8e]' : 'bg-lime-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Last activity {lastActivity}
      </div>
    </div>
  )
}
