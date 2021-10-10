/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formatDate(date: string, withTime = false) {
  return format(
    new Date(date),
    withTime ? "dd MMM yyyy' às 'HH:mm'" : 'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );
}
