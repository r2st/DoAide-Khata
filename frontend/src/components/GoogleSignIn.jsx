import { useEffect, useRef, useState } from 'react'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Could not load Google Sign-In'))
    document.head.appendChild(script)
  })
}

export default function GoogleSignIn({ clientId, onCredential, locale }) {
  const button = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    loadGis()
      .then(() => {
        if (!active || !button.current) return
        window.google.accounts.id.initialize({ client_id: clientId, callback: (resp) => onCredential(resp.credential) })
        window.google.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', text: 'signin_with', locale })
      })
      .catch((e) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [clientId, onCredential, locale])

  return (
    <div>
      <div ref={button} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
