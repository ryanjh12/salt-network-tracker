export const PHASES = {
  discovery: {
    id: 'discovery',
    label: 'Discovery Phase',
    duration: '1–2 Years',
    color: 'blue',
    steps: [
      'Start the Conversation',
      'Intent to Proceed',
      'Discovery Call #1 – Church Culture & College Ministry Expression',
      'Discovery Call #2 – Who is Salt Network?',
      'On-Site Visit to Network Church',
      'Discovery Call #3 – Network Church Visit Debrief',
      'On-Site Visit to Onboarding Church',
      'Discovery Call #4 – Church Visit Debrief',
      'Decision Time',
    ],
  },
  assimilation: {
    id: 'assimilation',
    label: 'Assimilation Phase',
    duration: '6–9 Months',
    color: 'lime',
    steps: [
      'Monthly Call Rhythm Established',
      'Network Staff On-Site at Onboarding Church',
      'Welcome Video Produced',
      'Salt Company Conference Inclusion',
      'Peer Calls Integration',
      'Job Shadow Visit to a Network Church',
      'Salt Leadership Summit Inclusion',
      'Fall Launch – New Branding & Identity',
    ],
  },
}

export const PHASE_ORDER = ['discovery', 'assimilation']

export function getStatus(lastActivityDate) {
  if (!lastActivityDate) return 'stalled'
  const days = Math.floor((Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 30) return 'on_track'
  if (days < 60) return 'needs_attention'
  return 'stalled'
}

export const STATUS_CONFIG = {
  on_track: { label: 'On Track', bg: 'bg-lime-100', text: 'text-lime-700', dot: 'bg-lime-500' },
  needs_attention: { label: 'Needs Attention', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  stalled: { label: 'Stalled', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}
