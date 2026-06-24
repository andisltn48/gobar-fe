import Card from '../../components/common/Card';

const stats = [
  { label: 'Total User Aktif', value: '--', icon: '👥', accent: 'border-brutal-yellow' },
  { label: 'Postingan Hari Ini', value: '--', icon: '📸', accent: 'border-brutal-green' },
  { label: 'Event Berjalan', value: '--', icon: '🗓', accent: 'border-brutal-blue' },
];

export default function DashboardReports() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-4">
        <h1 className="page-header">Dashboard</h1>
        <span className="brutal-stamp bg-brutal-yellow text-brutal-dark mb-2">
          📊 Reports
        </span>
      </div>
      <div className="brutal-divider" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label} hover className={`p-6 border-l-[5px] ${stat.accent}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-brutal-muted-light mb-2">
                  {stat.label}
                </p>
                <p className="font-heading text-4xl text-brutal-yellow">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
