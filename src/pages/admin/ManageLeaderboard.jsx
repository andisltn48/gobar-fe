import Card from '../../components/common/Card';

export default function ManageLeaderboard() {
  return (
    <div>
      <div className="flex items-end gap-4 mb-4">
        <h1 className="page-header">Leaderboard</h1>
        <span className="brutal-stamp bg-brutal-yellow text-brutal-dark mb-2">
          🏆 Verify
        </span>
      </div>
      <div className="brutal-divider" />

      <Card className="p-8 brutal-border text-center">
        <p className="font-heading text-2xl text-brutal-yellow uppercase mb-2">
          Coming Soon
        </p>
        <p className="font-body text-sm text-brutal-muted-light">
          Tabel verifikasi leaderboard akan ditampilkan di sini.
        </p>
      </Card>
    </div>
  );
}
