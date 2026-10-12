
/**
 * ExamSync Card Component (Section 7)
 * Hierarchy: primary | secondary | info | glass
 */
export function Card({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) {
  const variantClass = `card-${variant}`;
  const combinedClasses = `card ${variantClass} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
