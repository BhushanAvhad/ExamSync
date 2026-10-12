
/**
 * ExamSync Badge / Status Component (Section 20)
 * Variants: scheduled | pending | conflict | optimized | available | unavailable | completed
 */
export function Badge({
  children,
  variant = 'scheduled',
  showDot = true,
  className = '',
  ...props
}) {
  const normalizedVariant = variant.toLowerCase();
  const badgeClass = `badge badge-${normalizedVariant} ${className}`.trim();

  return (
    <span className={badgeClass} {...props}>
      {showDot && <span className="badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
