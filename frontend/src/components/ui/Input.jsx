
/**
 * ExamSync Input Component (Section 19)
 * Features: Dark surface background, subtle border, focus ring, optional prefix/suffix slots
 */
export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  prefixIcon,
  suffixAction,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const wrapperClass = `input-wrapper ${prefixIcon ? 'has-prefix' : ''} ${suffixAction ? 'has-suffix' : ''}`.trim();

  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          <span>
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
          </span>
        </label>
      )}

      <div className={wrapperClass}>
        {prefixIcon && <span className="input-prefix-icon">{prefixIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input-field"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {suffixAction && <div className="input-suffix-action">{suffixAction}</div>}
      </div>

      {error ? (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} className="input-helper">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default Input;
