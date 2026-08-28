import { classeMetodo, classeStatus, rotuloStatus } from '../utils/format';

export function Tag({ variante = 'tag-neutral', children, style }) {
  return (
    <span className={'tag ' + variante} style={style}>
      {children}
    </span>
  );
}

export function StatusTag({ status }) {
  return <Tag variante={classeStatus(status)}>{rotuloStatus(status)}</Tag>;
}

export function MetodoTag({ metodo, style }) {
  return (
    <Tag variante={classeMetodo(metodo)} style={style}>
      {metodo}
    </Tag>
  );
}
