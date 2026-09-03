import { methodClass } from '../utils/format';

export function MethodTag({ method }: { method: string }) {
  return <span className={methodClass(method)}>{method}</span>;
}
