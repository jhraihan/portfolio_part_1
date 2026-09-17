import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Request-flow diagram for a project.
 *
 * Drawn as inline SVG rather than an image so it inherits theme tokens,
 * stays crisp at any zoom, and costs no network request. Each project
 * supplies its own node/edge definition below.
 */

// Per-project flow definitions. Kept here rather than in the database
// because the shape of each diagram is a design decision, not content.
const FLOWS = {
  micromart: {
    caption: 'Checkout request path',
    nodes: [
      { id: 'client', label: 'React SPA', sub: 'browser', tone: 'client' },
      { id: 'api', label: 'Django + DRF', sub: 'JWT verified', tone: 'api' },
      { id: 'db', label: 'MySQL', sub: 'orders, inventory', tone: 'green' },
    ],
    branch: { from: 'api', label: 'SSLCommerz', sub: 'payment gateway', tone: 'amber' },
  },
  eduflow: {
    caption: 'Role-scoped request path',
    nodes: [
      { id: 'client', label: 'React + Vite', sub: 'role-aware UI', tone: 'client' },
      { id: 'api', label: 'DRF', sub: 'permission layer', tone: 'api' },
      { id: 'db', label: 'Database', sub: 'courses, results', tone: 'green' },
    ],
    branch: null,
  },
  intellichat: {
    caption: 'Streaming response path',
    nodes: [
      { id: 'client', label: 'React', sub: 'SSE listener', tone: 'client' },
      { id: 'api', label: 'Django', sub: 'stream relay', tone: 'api' },
      { id: 'db', label: 'PostgreSQL', sub: 'conversations', tone: 'green' },
    ],
    branch: { from: 'api', label: 'Gemini API', sub: 'token stream', tone: 'violet' },
    animated: true,
  },
  medidesk: {
    caption: 'Role-gated module access',
    nodes: [
      { id: 'client', label: 'React', sub: '4 role views', tone: 'client' },
      { id: 'api', label: 'Django + DRF', sub: 'JWT + RBAC', tone: 'api' },
      { id: 'db', label: 'Database', sub: 'records, billing', tone: 'green' },
    ],
    branch: null,
  },
  promptcanvas: {
    caption: 'Image generation path',
    nodes: [
      { id: 'client', label: 'React', sub: 'prompt input', tone: 'client' },
      { id: 'api', label: 'Django', sub: 'server-side call', tone: 'api' },
      { id: 'db', label: 'PostgreSQL', sub: 'stored images', tone: 'green' },
    ],
    branch: { from: 'api', label: 'Hugging Face', sub: 'inference API', tone: 'violet' },
  },
}

const TONE_CLASS = {
  client: 'text-accent',
  api: 'text-violet',
  green: 'text-green',
  amber: 'text-amber',
  violet: 'text-violet',
}

function Node({ label, sub, tone }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="rounded-lg border border-line bg-elevated px-3 py-3 text-center">
        <p className={`font-mono text-xs font-medium ${TONE_CLASS[tone]}`}>
          {label}
        </p>
        <p className="mt-1 font-mono text-[10px] text-ink-faint">{sub}</p>
      </div>
    </div>
  )
}

/** Horizontal connector, used between nodes on wider screens. */
function Arrow({ animated, reduced }) {
  return (
    <div className="hidden shrink-0 items-center px-1.5 sm:flex sm:px-3" aria-hidden="true">
      <svg width="34" height="12" viewBox="0 0 34 12" fill="none" className="text-line-strong">
        <path
          d="M0 6h26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className={animated && !reduced ? 'animate-dash' : undefined}
        />
        <path
          d="M26 2l5 4-5 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

/** Vertical connector, used when the flow stacks on narrow screens. */
function ArrowDown({ animated, reduced }) {
  return (
    <div className="flex justify-center py-1.5 sm:hidden" aria-hidden="true">
      <svg width="12" height="26" viewBox="0 0 12 26" fill="none" className="text-line-strong">
        <path
          d="M6 0v18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className={animated && !reduced ? 'animate-dash' : undefined}
        />
        <path
          d="M2 18l4 5 4-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

export function ArchitectureDiagram({ slug, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const flow = FLOWS[slug]

  // A project without a defined flow renders nothing rather than a broken box.
  if (!flow) return null

  const { nodes, branch, caption, animated } = flow

  return (
    <figure className={`overflow-hidden rounded-card border border-line bg-surface ${className}`}>
      <div className="window-bar">
        <span className="window-dot bg-accent/70" />
        <span className="window-dot bg-amber/60" />
        <span className="window-dot bg-green/60" />
        <span className="ml-2 font-mono text-[11px] text-ink-faint">{caption}</span>
      </div>

      <div className="bg-dots p-5 sm:p-7">
        {/* Flows left to right on wider screens and stacks vertically on
            narrow ones, so no node is ever clipped mid-word. */}
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="flex flex-col sm:flex-1 sm:flex-row sm:items-center"
            >
              <Node {...node} />
              {index < nodes.length - 1 && (
                <>
                  <ArrowDown animated={animated} reduced={reduced} />
                  <Arrow animated={animated} reduced={reduced} />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Optional external service, drawn hanging off the API node. */}
        {branch && (
          <div className="mt-1 flex justify-center">
            <div className="flex flex-col items-center">
              <svg
                width="2"
                height="26"
                viewBox="0 0 2 26"
                className="text-line-strong"
                aria-hidden="true"
              >
                <path
                  d="M1 0v26"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className={animated && !reduced ? 'animate-dash' : undefined}
                />
              </svg>
              <div className="rounded-lg border border-dashed border-line-strong bg-elevated px-4 py-2.5 text-center">
                <p className={`font-mono text-xs font-medium ${TONE_CLASS[branch.tone]}`}>
                  {branch.label}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                  {branch.sub}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </figure>
  )
}

export function hasDiagram(slug) {
  return Boolean(FLOWS[slug])
}
