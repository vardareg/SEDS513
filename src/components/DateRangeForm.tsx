import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { FormEvent } from 'react'
import type { DateRange } from '../data/types'
import { DATA_RANGE, formatDate, rangesEqual, validateDateRange } from '../lib/dates'
import { Button } from './ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field'
import { Input } from './ui/input'

// Meteorological seasons; winter continues into December of the previous year,
// so within 2025 it covers January and February only.
const QUICK_RANGES: readonly { label: string; range: DateRange }[] = [
  { label: 'Full year', range: { start: '2025-01-01', end: '2025-12-31' } },
  { label: 'Winter', range: { start: '2025-01-01', end: '2025-02-28' } },
  { label: 'Spring', range: { start: '2025-03-01', end: '2025-05-31' } },
  { label: 'Summer', range: { start: '2025-06-01', end: '2025-08-31' } },
  { label: 'Autumn', range: { start: '2025-09-01', end: '2025-11-30' } },
  { label: 'December', range: { start: '2025-12-01', end: '2025-12-31' } },
]

interface Props {
  applied: DateRange
  onApply: (range: DateRange) => void
  onApplyExternal: (range: DateRange) => void
  onReset: () => void
}

export function DateRangeForm({ applied, onApply, onApplyExternal, onReset }: Props) {
  const [draft, setDraft] = useState<DateRange>({ ...applied })
  const [touched, setTouched] = useState({ start: false, end: false })
  const [announcement, setAnnouncement] = useState('')
  const startRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)
  const errors = validateDateRange(draft)
  const pending = !rangesEqual(draft, applied)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ start: true, end: true })
    if (errors.start || errors.end) {
      setAnnouncement('Dates were not applied. Correct the highlighted field.')
      ;(errors.start ? startRef : endRef).current?.focus()
      return
    }
    onApply({ ...draft })
    setAnnouncement(`Dates applied: ${formatDate(draft.start)} to ${formatDate(draft.end)}.`)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="date-form">
      <FieldSet className="control-section">
        <FieldLegend className="step-heading"><span className="step-number">2</span> Choose dates</FieldLegend>
        <FieldDescription id="date-help">Available: 1 Jan–31 Dec 2025. Both dates are included. Quick ranges follow meteorological seasons.</FieldDescription>
        <FieldGroup className="control-fields">
          {(['start', 'end'] as const).map((field) => {
            const error = touched[field] ? errors[field] : undefined
            return (
              <Field key={field} data-invalid={Boolean(error)}>
                <FieldLabel htmlFor={`${field}-date`}>{field === 'start' ? 'Start date' : 'End date'}</FieldLabel>
                <Input
                  ref={field === 'start' ? startRef : endRef}
                  id={`${field}-date`}
                  name={`${field}-date`}
                  type="date"
                  autoComplete="off"
                  required
                  min={DATA_RANGE.start}
                  max={DATA_RANGE.end}
                  value={draft[field]}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`date-help${error ? ` ${field}-error` : ''}`}
                  onBlur={(event) => {
                    // Let the action finish before revealing errors: inserting a message
                    // during pointer-down can move the button before pointer-up.
                    const target = event.relatedTarget
                    if (target instanceof HTMLButtonElement && target.form === event.currentTarget.form) return
                    setTouched((previous) => ({ ...previous, [field]: true }))
                  }}
                  onChange={(event) => {
                    setDraft((previous) => ({ ...previous, [field]: event.target.value }))
                    setAnnouncement('')
                  }}
                />
                {error ? <FieldError id={`${field}-error`}>{error}</FieldError> : null}
              </Field>
            )
          })}
        </FieldGroup>
        <div className="date-actions">
          <Button type="submit">Apply dates</Button>
          <Button variant="outline" type="button" onClick={onReset}><RotateCcw aria-hidden="true" data-icon="inline-start" />Reset all</Button>
        </div>
        <div className="quick-ranges" role="group" aria-label="Quick date ranges">
          {QUICK_RANGES.map(({ label, range }) => (
            <Button
              key={label}
              variant="outline"
              size="xs"
              type="button"
              aria-pressed={rangesEqual(applied, range)}
              onClick={() => onApplyExternal({ ...range })}
            >
              {label}
            </Button>
          ))}
        </div>
          <p className={pending ? 'pending-message' : 'date-status'} role="status" aria-live="polite" aria-atomic="true">
            {pending ? 'Date changes not applied' : announcement || (rangesEqual(applied, DATA_RANGE) ? 'Full year selected' : 'Dates match the applied range')}
          </p>
        {pending && announcement ? <p className="form-message" role="status">{announcement}</p> : null}
      </FieldSet>
    </form>
  )
}
