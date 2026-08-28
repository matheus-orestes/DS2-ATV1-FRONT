import { useCallback, useEffect, useRef, useState } from 'react';

/** Aviso temporário no canto da tela, com a resposta HTTP como legenda. */
export function useToast(duracao = 3200) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const avisar = useCallback(
    (mensagem, meta) => {
      setToast({ mensagem, meta });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), duracao);
    },
    [duracao]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, avisar };
}
