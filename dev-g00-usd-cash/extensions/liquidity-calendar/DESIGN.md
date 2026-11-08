# Design: liquidity calendar

This page extends the visual system of the accepted dashboard (`../../index.html`). It reuses that system's tokens, controls and sheets and adds only the calendar-specific parts below.

- **Mode:** Operate, meaning the user is completing a task.
- **Scene:** a family-office client and an advisor in a daylit office, on a laptop or a projected screen, with a printed summary as the take-away. The theme is light.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#17343e` | Text, fixed-payment marker, primary button |
| `--muted` | `#536970` | Secondary text, saved-quote marker |
| `--teal` | `#007477` | Maturity tags, outline on the nearest earlier maturity, links |
| `--gold` | `#99621d` | Focus ring, selection ring on the chosen payment, underline on today |
| `--wait` | `#f6e6cf` | Days cash waits for the selected payment |
| `--paper` | `#f2f4f0` | Page ground, table header, readout |
| `--line` | `#dbe3df` | Rules and cell borders |
| `--soft` | `#eaf3ee` | Fresh-data status, selected list item and table row, hover |
| `--warning` | `#fff1dc` | Stale-data status and pill |
| `--red` | `#933e2e` | Errors and the data-failure banner |
| `--weekend` | `#f7f8f5` | Saturday and Sunday columns |

The colour strategy is restrained: neutrals carry the page, teal marks maturities and gold marks the selected payment and keyboard focus. The focus ring uses `--gold` (5.1:1 on white) rather than the dashboard's lighter `#c9903f`, which falls below the 3:1 non-text contrast minimum.

## Type

- One family: the system sans stack, 16px/1.5, with tabular figures throughout.
- Headings: h1 32px/1.15 at -0.035em (27px on phones), h2 22px, h3 15–16px.
- Body sizes: panel copy 14px; field labels 13px bold; help text 12px; day numbers 12px.
- Tags and the `×n` badge: 11px bold.
- Dates and terms such as `8-week` never break across lines (`.nb`).
- No eyebrow labels and no section numbers; headings carry the hierarchy on their own.

## Layout

- **Header:** brand on the left, saved-quote pill on the right.
- **Above 760px:** a two-column grid, `300px | 1fr`, with areas `"aside intro" / "aside content"`. The form sheet scrolls with the page, so every entry and action stays visible.
- **760px and below:** a single column in reading order: title and status, then the form, then the calendar, the table, the summary and About.
- **Month pages:** an auto-fill grid with a 290px minimum (three across at 1440px, one on a phone), aligned to the top. Each month is a fixed-layout table that starts on Monday, with 50px cells (46px on phones). Blank cells draw no border, so the neighbouring borders stay whole. A note under the pages lists any reference bill that matures after the last page shown.

## Components

- **Sheet:** white, 1px `--line` border, 12px radius, 24px padding (18px × 14px on phones).
- **Controls:** 7px radius and a 1px `#a9b9b2` border. The primary button is filled with ink. Focus shows a 3px `--gold` outline with a 3px offset. Disabled controls are greyed and show a not-allowed cursor.
- **Status line:** full 1px border with a tint (`--soft`, or `--warning` when stale), never a side stripe.
- **Calendar cells:** these states can combine.
  - Weekend: tinted column.
  - Saved quote date: muted ring around the number plus a "Q" tag.
  - Maturity: teal pill tag such as `13w`, with hidden text "13-week reference matures".
  - Nearest maturity on or before the selected payment: 2px teal inset outline.
  - Next maturity after it: the tag is drawn in outline.
  - Waiting days: `--wait` tint from the day after that maturity through the payment day.
  - Today: bold number with a 3px gold underline.
  - Payment: an ink disc for a fixed USD payment, a dashed ink ring for a price-sensitive budget, a gold ring when selected, and a `×n` badge when several payments share a day. Payment cells are buttons with `aria-pressed`.
- **Legend:** shows neutral samples, so no sample contradicts the current selection: the Q tag, a filled teal swatch for a maturity tag, an outlined one for the next maturity, the teal outline, both payment marks, the wait tint and the today bar.
- **Readout:** one sentence above the months describing the selected payment's fit, with the payment name and long date in bold.
- **Entry list:** name, then date and short type on one line. Remove and Clear all offer a one-step Undo.
- **Fit table:** Date, Payment, Payment type, Matures on or before, Cash waits, Next maturity after.
  - The date button selects the payment and moves focus to its calendar mark; the selected row is tinted `--soft`.
  - At 760px and below, rows stack, and each value carries its column name as a caption.
- **Discussion summary:** a bordered memo with a 78ch measure. Copy and print are disabled while there are no payments.
- **Data-failure banner:** red, under the page title, naming the problem and the refresh command.

## Interaction

Every action that redraws the page names where keyboard focus lands:

| Action | Focus goes to |
|---|---|
| Add | Payment field |
| Select from the list | That entry |
| Select from the calendar | That mark |
| Date in the table | The payment's calendar mark |
| Remove | The next entry, or the Payment field |
| Clear all | Payment field |
| Undo, Try example dates | The first entry |

The source link opens in a new tab, so leaving the page never clears the entries.

## Motion

Transitions of 150–200 ms with ease-out on button backgrounds, the cell tint and the payment marker's scale on hover. All are removed under `prefers-reduced-motion`.

## Accessibility

- Every marker has a text equivalent.
- The readout and the saved-quote pill are live regions.
- Form errors use `role="alert"` and mark the field `aria-invalid`.
- Accessible names begin with the visible text.
- Statuses are written in words, never shown by colour alone.

## Print

Printing keeps the header, the fit table (11px) and the discussion summary. The form, the calendar, the About section and the buttons are hidden. The phone rules apply to screens only, so a printed page keeps the table layout.
