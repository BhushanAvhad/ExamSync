/**
 * Reusable Admin Page Header with Title, Subtitle, Breadcrumb, and Action Buttons
 */
export function PageHeader({
  title,
  subtitle,
  category = 'Workspace',
  badge,
  actions,
}) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header-main">
        <div className="admin-breadcrumb">
          <span className="breadcrumb-category">{category}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{title}</span>
        </div>
        <div className="admin-title-row">
          <h1 className="admin-page-title">{title}</h1>
          {badge && <div className="admin-page-header-badge">{badge}</div>}
        </div>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="admin-page-header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
