import { useId, useMemo, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { PLACES } from '@/data/fixtures'
import { usePrefs } from '@/i18n/preferences'
import { cn } from '@/lib/utils'

/** Accessible autocomplete limited to places in the coverage area. */
export function PlaceInput({
  label,
  placeholder,
  value,
  onChange,
  invalid,
  className,
}: {
  label: string
  placeholder: string
  value: string | null
  onChange: (id: string | null) => void
  invalid?: boolean
  className?: string
}) {
  const { place, lang, t } = usePrefs()
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const text = query ?? (value ? place(value) : '')
  const matches = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase()
    const list = q
      ? PLACES.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.nameHi.includes(q) ||
            p.district.toLowerCase().includes(q),
        )
      : PLACES
    return list.slice(0, 8)
  }, [query])

  const choose = (pid: string) => {
    onChange(pid)
    setQuery(null)
    setOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </label>
      <div className="relative">
        <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          aria-activedescendant={open && matches[active] ? `${listId}-${matches[active].id}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120)
            if (query !== null && query.trim() === '') {
              onChange(null)
              setQuery(null)
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
            if (value) onChange(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((a) => Math.min(a + 1, matches.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && open && matches[active]) {
              e.preventDefault()
              choose(matches[active].id)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className={cn(
            'h-12 w-full rounded-xl border border-input bg-raised pr-3 pl-10 text-base text-foreground placeholder:text-muted-foreground',
            invalid && 'border-status-dnt',
          )}
        />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-(--z-content) mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-xl"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">{t('search.noMatch')}</li>
          ) : (
            matches.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(p.id)
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-sm',
                  i === active && 'bg-accent',
                )}
              >
                <span className="font-medium">{lang === 'hi' ? p.nameHi : p.name}</span>
                <span className="text-xs text-muted-foreground">{p.district}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
