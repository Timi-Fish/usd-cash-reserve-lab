import {unbreakableParts} from '../format.js';

// Renders text with dates and "8-week"-style terms kept on one line; copied text still comes from the plain string.
export const NoBreak = ({text}) => unbreakableParts(text).map((part, i) => i % 2 ? <span key={i} className="nb">{part}</span> : part);
