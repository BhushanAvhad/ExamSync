export function StatCard({
  label,
  value,
  icon,
  helperText,
  accent = 'indigo',
  onClick,
}) {
  return (
    <div
      className={`admin-stat-card accent-${accent} ${onClick ? 'is-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {icon && <div className="stat-card-icon-box">{icon}</div>}
      </div>
      <div className="stat-card-value">{value}</div>
      {helperText && <div className="stat-card-helper">{helperText}</div>}
    </div>
  );
}

export default StatCard;
