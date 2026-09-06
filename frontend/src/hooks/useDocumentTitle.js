import { useEffect } from 'react'

const SITE_NAME = 'Md. Jahid Hasan Raihan'

/** Sets the document title and meta description for a page. */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME

    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'description'
        document.head.appendChild(meta)
      }
      meta.content = description
    }
  }, [title, description])
}
