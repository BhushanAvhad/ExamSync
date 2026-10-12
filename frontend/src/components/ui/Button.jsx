
/**
 * ExamSync Button Component (Section 18)
 * Variants: primary | secondary | danger | ghost
 * Sizes: sm | md | lg
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const combinedClasses = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
