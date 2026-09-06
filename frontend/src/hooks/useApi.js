import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an API call and tracks loading, data, and error state.
 *
 * `deps` controls re-fetching. The in-flight request is tracked so a response
 * that arrives after the component unmounts, or after a newer request was
 * issued, never sets state.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (id === requestId.current) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (id === requestId.current) {
          setError(err)
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    return () => {
      // Invalidate any in-flight request on unmount.
      requestId.current++
    }
  }, [run])

  return { data, loading, error, refetch: run }
}
