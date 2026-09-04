import type { ImgHTMLAttributes } from 'react';

interface MascotProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  size?: number | string;
}

export function Mascot({ size = 72, className = '', alt = 'Mascote Contrata RH', style, ...props }: MascotProps) {
  return (
    <img
      src="/contrata-rh-mascot.jpeg"
      alt={alt}
      className={`mascot-image ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}
