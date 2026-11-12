import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Logo } from '@/components/logo'

/**
 * Start screen. It is part of the server-rendered HTML, so it paints before any
 * JavaScript runs. Its CSS reveals it only after 300ms (see `.rp-boot` in
 * styles.css), so a fast load never shows it. It is removed when React has
 * hydrated. No progress is faked and no timer decides when it goes away.
 */

export type BootState = 'loading' | 'error'

export function BootScreen({ state = 'loading' }: { state?: BootState }) {
  const failed = state === 'error'
  return (
    <div id="rp-boot" className="rp-boot" role="status" data-state={state}>
      <div data-boot-loading hidden={failed} className="rp-boot-body">
        <Logo variant="full" decorative className="rp-boot-logo" />
        <span className="sr-only">Loading RaahPrahari</span>
      </div>
      <div data-boot-error hidden={!failed} className="rp-boot-body rp-boot-error">
        <Logo variant="mark" decorative />
        <p className="rp-boot-title">
          <span lang="en">RaahPrahari could not load.</span>{' '}
          <span lang="hi">RaahPrahari लोड नहीं हो सका।</span>
        </p>
        <button type="button" data-boot-reload className="rp-boot-reload">
          <span lang="en">Reload</span> / <span lang="hi">पुनः लोड करें</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Runs before hydration. If a script fails to load it switches the start screen to
 * its error state, and it wires the Reload button. Plain ES5 on purpose.
 */
export const bootGuardScript = `(function(){var b=document.getElementById('rp-boot');if(!b)return;
function fail(){b.setAttribute('data-state','error');var l=b.querySelector('[data-boot-loading]'),e=b.querySelector('[data-boot-error]');if(l)l.hidden=true;if(e)e.hidden=false;}
window.addEventListener('error',function(ev){var t=ev.target;if(t&&t.tagName==='SCRIPT')fail();},true);
b.addEventListener('click',function(ev){var t=ev.target;if(t&&t.closest&&t.closest('[data-boot-reload]'))location.reload();});
})();`

/** Renders the start screen until the app has hydrated, then removes it and clears aria-busy on main. */
export function BootGate() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
    document.getElementById('main')?.removeAttribute('aria-busy')
  }, [])
  if (ready) return null
  return <BootScreen />
}

/** Slim top bar for route changes. Appears only if a navigation takes longer than ~150ms. */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.isLoading || s.status === 'pending' })
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!pending) {
      setShow(false)
      return
    }
    const id = window.setTimeout(() => setShow(true), 150)
    return () => window.clearTimeout(id)
  }, [pending])
  if (!show) return null
  return <div aria-hidden="true" className="rp-route-progress" />
}
