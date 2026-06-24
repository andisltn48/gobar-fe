import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { extractError } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const user = res.data.data;
      login(user, user.token);
      navigate('/');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-grid-margin">
      <div className="relative z-10 w-full max-w-sm">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary-container border-4 border-black rotate-12 z-20 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container text-[20px]">directions_bike</span>
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-container border-4 border-black -rotate-6 z-20" />

        <Card className="p-lg relative overflow-hidden">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-primary-container" />

          <div className="text-center mb-lg">
            <h1 className="font-display text-3xl sm:text-display-lg-mobile uppercase text-on-surface leading-none tracking-tighter font-black">
              GowesBareng
            </h1>
            <p className="font-mono text-label-sm uppercase tracking-[0.3em] text-on-surface-variant mt-sm">
              Masuk ke akun
            </p>
          </div>

          {error && (
            <div className="bg-error-container border-4 border-black p-sm mb-md animate-shake">
              <p className="font-mono text-label-sm text-on-error-container text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <Input
              label="Email"
              type="email"
              placeholder="admin@gowesbareng.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Masuk
                </span>
              )}
            </Button>
          </form>

          <p className="font-mono text-label-sm text-outline text-center mt-lg uppercase tracking-wider">
            © {new Date().getFullYear()} GowesBareng
          </p>
        </Card>
      </div>
    </div>
  );
}
