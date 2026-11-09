import {FormField, FormFieldHelperText, FormFieldLabel, NumberInput, ToggleButton, ToggleButtonGroup} from '@salt-ds/core';
import {usd} from '../format.js';

// Shared scenario inputs. Values stay as typed; App turns them into numbers and evaluate() reports any problem.
// Inputs use the secondary variant because they sit on primary (white) cards.
export function Assumptions({dash, inputs, setInputs, error}) {
  const set = patch => setInputs(current => ({...current, ...patch}));
  const status = error === null ? undefined : 'error';
  const amount = Number(inputs.principal);
  return (
    <div className="assumptions">
      <FormField validationStatus={status}>
        <FormFieldLabel>Cash placed</FormFieldLabel>
        <NumberInput variant="secondary" value={inputs.principal} onChange={(event, value) => set({principal: value})}
          min={1} max={100000000} step={1000} startAdornment="$" hideButtons />
        <FormFieldHelperText>{error === null && Number.isFinite(amount) ? `${usd(amount)} in USD.` : 'An amount above zero, up to $100 million.'}</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Reference bill</FormFieldLabel>
        <ToggleButtonGroup sentiment="accented" value={String(inputs.weeks)} onChange={event => set({weeks: Number(event.currentTarget.value)})}>
          {dash.instruments.map(q => <ToggleButton key={q.weeks} value={String(q.weeks)}>{q.name}</ToggleButton>)}
        </ToggleButtonGroup>
      </FormField>
      <FormField validationStatus={status}>
        <FormFieldLabel>Assumed annual inflation</FormFieldLabel>
        <NumberInput variant="secondary" value={inputs.inflation} onChange={(event, value) => set({inflation: value})}
          min={-5} max={15} step={0.5} endAdornment="%" />
        <FormFieldHelperText>{error === null ? 'From −5% to 15%. An assumption, not a forecast or the latest CPI.' : error}</FormFieldHelperText>
      </FormField>
    </div>
  );
}
