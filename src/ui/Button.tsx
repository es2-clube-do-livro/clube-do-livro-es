import type { ComponentProps } from 'react';

import styles from './Button.module.css';
import { cx } from './cx';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

/** Botão comum (`type="button"`), a não ser que receba outro tipo, como `submit`. */
export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...props} />
  );
}
