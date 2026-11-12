import { useEffect, useSyncExternalStore } from 'react'
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
function fail(){b.setAttribute('data-state','error');var l=b.querySelector('[data-boot-loading]'),e=b.querySelector('[data-boot-error]'),m=document.getElementById('main');if(l)l.hidden=true;if(e)e.hidden=false;if(m)m.removeAttribute('aria-busy');}
window.setTimeout(function(){if(document.getElementById('rp-boot'))fail();},15000);
window.addEventListener('error',function(ev){var t=ev.target;if(t&&t.tagName==='SCRIPT')fail();},true);
b.addEventListener('click',function(ev){var t=ev.target;if(t&&t.closest&&t.closest('[data-boot-reload]'))location.reload();});
})();`

function subscribeToBootReady(onStoreChange: () => void) {
  window.addEventListener('rp-boot-ready', onStoreChange)
  return () => window.removeEventListener('rp-boot-ready', onStoreChange)
}

function getBootReady() {
  return document.getElementById('main')?.getAttribute('aria-busy') !== 'true'
}

/** Renders the start screen until hydration completes, then clears the busy state. */
export function BootGate() {
  const ready = useSyncExternalStore(subscribeToBootReady, getBootReady, () => false)
  useEffect(() => {
    document.getElementById('main')?.removeAttribute('aria-busy')
    window.dispatchEvent(new Event('rp-boot-ready'))
  }, [])
  if (ready) return null
  return <BootScreen />
}

/** Slim top bar for route changes. Appears only if a navigation takes longer than ~150ms. */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.isLoading || s.status === 'pending' })
  if (!pending) return null
  return <div aria-hidden="true" className="rp-route-progress" />
}
