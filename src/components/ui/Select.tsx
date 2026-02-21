import { forwardRef, useId } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, fullWidth = true, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const wrapperClasses = [
      'select-wrapper',
      fullWidth ? 'select-wrapper--full-width' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const selectClasses = [
      'select__field',
      error ? 'select__field--error' : '',
      props.disabled ? 'select__field--disabled' : '',
      !props.value && placeholder ? 'select__field--placeholder' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className="select__label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <div className="select__container">
          <select ref={ref} id={selectId} className={selectClasses} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="select__chevron">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && <p className="select__error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
