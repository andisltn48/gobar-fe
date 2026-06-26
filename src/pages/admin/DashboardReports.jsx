import Card from '../../components/common/Card';

const stats = [
  { label: 'Total User Aktif', value: '142', icon: '👥', accent: 'border-l-[#caf300]' },
  { label: 'Postingan Hari Ini', value: '18', icon: '📸', accent: 'border-l-[#006970]' },
  { label: 'Event Berjalan', value: '5', icon: '🗓', accent: 'border-l-[#ac2e00]' },
];

export default function DashboardReports() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-4">
        <h1 className="page-header">Dashboard</h1>
        <span className="neo-stamp mb-2">
          📊 Reports
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
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
