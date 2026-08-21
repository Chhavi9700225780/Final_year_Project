const KPICard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span>{title}</span>

        {Icon && <Icon size={20} />}
      </div>

      <div className="kpi-value">
        {value}
      </div>

      {subtitle && (
        <div className="kpi-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default KPICard;