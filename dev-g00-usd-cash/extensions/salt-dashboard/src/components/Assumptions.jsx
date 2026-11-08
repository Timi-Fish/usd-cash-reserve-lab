import {FormField, FormFieldHelperText, FormFieldLabel, NumberInput, ToggleButton, ToggleButtonGroup} from '@salt-ds/core';

// Shared scenario inputs. Values stay as typed; App turns them into numbers and evaluate() reports any problem.
export function Assumptions({dash, inputs, setInputs, error}) {
  const set = patch => setInputs(current => ({...current, ...patch}));
  const status = error === null ? undefined : 'error';
  return (
    <div className="assumptions">
      <FormField validationStatus={status}>
        <FormFieldLabel>Cash placed</FormFieldLabel>
        <NumberInput value={inputs.principal} onChange={(event, value) => set({principal: value})}
          min={1} max={100000000} step={1000} startAdornment="$" hideButtons />
      </FormField>
      <FormField>
        <FormFieldLabel>Reference bill</FormFieldLabel>
        <ToggleButtonGroup value={String(inputs.weeks)} onChange={event => set({weeks: Number(event.currentTarget.value)})}>
          {dash.instruments.map(q => <ToggleButton key={q.weeks} value={String(q.weeks)}>{q.name}</ToggleButton>)}
        </ToggleButtonGroup>
      </FormField>
      <FormField validationStatus={status}>
        <FormFieldLabel>Assumed annual inflation</FormFieldLabel>
        <NumberInput value={inputs.inflation} onChange={(event, value) => set({inflation: value})}
          min={-5} max={15} step={0.5} endAdornment="%" />
        <FormFieldHelperText>{error === null ? 'From −5% to 15%. An assumption, not a forecast or the latest CPI.' : error}</FormFieldHelperText>
      </FormField>
    </div>
  );
}
