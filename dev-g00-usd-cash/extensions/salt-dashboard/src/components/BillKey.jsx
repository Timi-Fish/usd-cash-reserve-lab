// A bill's colour key and its label as one inline unit, so the key stays centred on the text wherever it sits
// (a checkbox label, a table heading, a list); the colour comes from brand.css.
export const BillKey = ({tenor, children}) => (
  <span className="keyed"><span className="bill-key" data-tenor={tenor} aria-hidden="true" />{children}</span>
);
