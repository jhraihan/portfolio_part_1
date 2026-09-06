import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="section">
      <div className="container-content">
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="font-mono text-sm text-accent">404</p>
          <h1 className="mt-4 text-heading-lg font-semibold text-ink">
            Page not found
          </h1>
          <p className="prose-body mt-3">
            That page does not exist, or it has moved.
          </p>
          <Link to="/" className="btn-secondary mt-8">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
