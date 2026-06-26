import Card from '../../components/common/Card';

const stats = [
  { label: 'Total User Aktif', value: '142', icon: 'fa-solid fa-users', accent: 'border-l-[#caf300]' },
  { label: 'Postingan Hari Ini', value: '18', icon: 'fa-solid fa-camera', accent: 'border-l-[#006970]' },
  { label: 'Event Berjalan', value: '5', icon: 'fa-solid fa-calendar-days', accent: 'border-l-[#ac2e00]' },
];

export default function DashboardReports() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-4">
        <h1 className="page-header">Dashboard</h1>
        <span className="neo-stamp mb-2 flex items-center gap-1.5">
          <i className="fa-solid fa-chart-simple text-[12px]" /> Reports
        </span>
      </div>
      <div className="neo-divider" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label} hover className={`p-6 border-l-[8px] ${stat.accent}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
                  {stat.label}
                </p>
                <p className="font-display text-4xl text-black font-black">{stat.value}</p>
              </div>
              <i className={`${stat.icon} text-3xl text-black/70`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
