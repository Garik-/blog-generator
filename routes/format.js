import { format, formatISO } from 'date-fns';

export function formatDate(dateMs) {
  const date = new Date(dateMs);
  return format(
    date,
    date.getFullYear() === new Date().getFullYear() ? 'MMM d' : 'MMM d, yyyy'
  );
}

export { formatISO };
