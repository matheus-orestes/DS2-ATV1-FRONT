import { statusClass, statusLabel } from '../utils/format';
import type { StatusFuncionario } from '../types/funcionario';

export function StatusTag({ status }: { status: StatusFuncionario }) {
  return <span className={statusClass(status)}>{statusLabel(status)}</span>;
}
