import { PHASES, PHASE_ORDER } from '../data/phases'

export default function StepTracker({ church }) {
  return (
    <div className="space-y-6">
      {PHASE_ORDER.map((phaseId) => {
        const phase = PHASES[phaseId]
        const isCurrentPhase = church.current_phase === phaseId
        const isCompletedPhase =
          PHASE_ORDER.indexOf(phaseId) < PHASE_ORDER.indexOf(church.current_phase)

        return (
          <div key={phaseId} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isCompletedPhase ? (
                  <span className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isCurrentPhase ? 'border-[#1e3a5f] bg-[#1e3a5f]' : 'border-gray-200 bg-white'
                  }`}>
                    {isCurrentPhase && <span className="w-2 h-2 bg-white rounded-full" />}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-[#1e3a5f] text-sm">{phase.label}</h3>
                  <span className="text-xs text-gray-400">{phase.duration}</span>
                </div>
              </div>
              {isCompletedPhase && (
                <span className="text-xs font-semibold bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full">Complete</span>
              )}
              {isCurrentPhase && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">In Progress</span>
              )}
            </div>

            <div className="space-y-2">
              {phase.steps.map((step, idx) => {
                let state = 'upcoming'
                if (isCompletedPhase) {
                  state = 'completed'
                } else if (isCurrentPhase) {
                  if (idx < church.current_step) state = 'completed'
                  else if (idx === church.current_step) state = 'current'
                  else state = 'upcoming'
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      state === 'current'
                        ? 'bg-blue-50 border border-blue-100'
                        : state === 'completed'
                        ? 'bg-lime-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <StepIcon state={state} />
                    <span
                      className={
                        state === 'completed'
                          ? 'text-lime-700 font-medium'
                          : state === 'current'
                          ? 'text-[#1e3a5f] font-semibold'
                          : 'text-gray-400'
                      }
                    >
                      {idx + 1}. {step}
                    </span>
                    {state === 'current' && (
                      <span className="ml-auto text-xs bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Current
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StepIcon({ state }) {
  if (state === 'completed') {
    return (
      <span className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span className="w-5 h-5 rounded-full border-2 border-[#1e3a5f] flex items-center justify-center shrink-0">
        <span className="w-2 h-2 bg-[#1e3a5f] rounded-full" />
      </span>
    )
  }
  return <span className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
}
