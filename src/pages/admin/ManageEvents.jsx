import Card from '../../components/common/Card';

export default function ManageEvents() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-4">
        <h1 className="page-header">Events</h1>
        <span className="neo-stamp mb-2">
          🗓 Manage
        </span>
      </div>
      <div className="neo-divider" />

      <Card className="p-8 text-center">
        <p className="font-display text-2xl text-primary font-black uppercase mb-2">
          Coming Soon
        </p>
        <p className="font-body text-sm text-on-surface-variant font-medium">
          Tabel manajemen event akan ditampilkan di sini.
        </p>
      </Card>
    </div>
  );
}
