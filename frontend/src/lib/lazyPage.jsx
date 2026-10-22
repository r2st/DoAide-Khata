import { lazy } from 'react'

// React.lazy that renders synchronously once its chunk has loaded. preload() lets the
// app fetch every page on idle (so they work offline) and lets tests render without
// waiting on Suspense.
export function lazyPage(load) {
  let Loaded = null
  const fetchPage = () =>
    load().then((m) => {
      Loaded = m.default
      return m
    })
  const Lazy = lazy(fetchPage)
  function Page(props) {
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />
  }
  Page.preload = fetchPage
  return Page
}
