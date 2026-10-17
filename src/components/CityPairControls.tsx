import { ArrowLeftRight } from 'lucide-react'
import type { Ref } from 'react'
import { CITIES, CITY_IDS, isCityId } from '../data/cities'
import type { CityId, CitySelection } from '../data/types'
import { Button } from './ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field'
import { NativeSelect, NativeSelectOption } from './ui/native-select'

interface Props {
  selection: CitySelection
  onChange: (slot: 0 | 1, value: CityId | null) => void
  onSwap: () => void
  firstSelectRef: Ref<HTMLSelectElement>
}

export function CityPairControls({ selection, onChange, onSwap, firstSelectRef }: Props) {
  return (
    <FieldSet className="control-section">
      <FieldLegend className="step-heading"><span className="step-number">1</span> Choose two cities</FieldLegend>
      <FieldDescription id="city-help">Choose a different city in each field.</FieldDescription>
      <FieldGroup className="control-fields">
        {([0, 1] as const).map((slot) => (
          <Field key={slot}>
            <FieldLabel htmlFor={`city-${slot}`}>City {slot + 1}</FieldLabel>
            <NativeSelect
              ref={slot === 0 ? firstSelectRef : undefined}
              id={`city-${slot}`}
              name={`city-${slot + 1}`}
              value={selection[slot] ?? ''}
              aria-describedby="city-help"
              onChange={(event) => onChange(slot, isCityId(event.target.value) ? event.target.value : null)}
            >
              <NativeSelectOption value="">Choose city…</NativeSelectOption>
              {CITY_IDS.map((city) => (
                <NativeSelectOption key={city} value={city} disabled={selection[1 - slot] === city}>
                  {CITIES[city].name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        ))}
      </FieldGroup>
      <Button
        variant="ghost"
        size="xs"
        type="button"
        className="swap-button"
        onClick={onSwap}
        disabled={selection[0] === null && selection[1] === null}
      >
        <ArrowLeftRight aria-hidden="true" data-icon="inline-start" />Swap cities
      </Button>
    </FieldSet>
  )
}
