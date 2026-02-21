import { forwardRef, useId } from 'react';
import './Input.css';

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  type?: InputType;
  error?: string;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text', error, iconLeft, fullWidth = true, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const wrapperClasses = [
      'input-wrapper',
      fullWidth ? 'input-wrapper--full-width' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'input__field',
      error ? 'input__field--error' : '',
      iconLeft ? 'input__field--with-icon' : '',
      props.disabled ? 'input__field--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className="input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="input__container">
          {iconLeft && <span className="input__icon">{iconLeft}</span>}
          <input ref={ref} id={inputId} type={type} className={inputClasses} {...props} />
        </div>
        {error && <p className="input__error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
