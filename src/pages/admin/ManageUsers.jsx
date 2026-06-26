import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../services/api';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/users';
import { showError, showConfirm } from '../../utils/alert';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    role: 'user',
    avatar_url: '',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddClick = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      city: '',
      role: 'user',
      avatar_url: '',
    });
    setModalType('add');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: '', // leave empty to not change
      city: user.city,
      role: user.role,
      avatar_url: user.avatar_url || '',
    });
    setSelectedUserId(user.id);
    setModalType('edit');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (currentUser && currentUser.id === id) {
      showError('HAPUS GAGAL', 'Anda tidak bisa menghapus akun admin Anda sendiri!');
      return;
    }

    const confirmed = await showConfirm(
      'HAPUS USER',
      'Apakah Anda yakin ingin menghapus user ini?'
    );
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await deleteUser(id);
      setSuccessMessage('User berhasil dihapus!');
      loadUsers();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (modalType === 'add') {
        await createUser(form);
        setSuccessMessage('User baru berhasil ditambahkan!');
      } else {
        await updateUser(selectedUserId, form);
        setSuccessMessage('User berhasil diperbarui!');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setModalError(extractError(err));
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <div className="flex items-end gap-4 mb-2">
            <h1 className="page-header">Users</h1>
            <span className="neo-stamp mb-2">
              👥 Manage
            </span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant uppercase">
            Kelola data dan peranan anggota GowesBareng
          </p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          Add User
        </Button>
      </div>

      <div className="neo-divider" />

      {successMessage && (
        <div className="bg-[#caf300] border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-label-md text-on-primary-fixed flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="font-black hover:opacity-75">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake font-mono text-label-md text-on-error-container flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-black hover:opacity-75">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-display text-2xl text-primary font-black uppercase mb-2">
            No Users Found
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Belum ada data user terdaftar di sistem.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#536600] border-b-4 border-black text-white font-mono text-xs uppercase tracking-wider">
                <th className="p-4 border-r-4 border-black">Name</th>
                <th className="p-4 border-r-4 border-black">Email</th>
                <th className="p-4 border-r-4 border-black">City</th>
                <th className="p-4 border-r-4 border-black">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black font-body text-sm text-on-surface">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#caf300]/10 transition-colors">
                  <td className="p-4 border-r-4 border-black font-semibold flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#caf300] text-[#171e00] font-display font-black flex items-center justify-center text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden relative">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover absolute inset-0" />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="truncate max-w-[150px]">{u.name}</span>
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs">{u.email}</td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs uppercase">{u.city}</td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs uppercase">
                    <span className={`px-2 py-0.5 border-2 border-black font-black text-[10px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${u.role === 'admin' ? 'bg-[#caf300] text-[#171e00]' : 'bg-white text-black'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="px-3 py-1.5 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300]/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                    >
                      Edit
                    </button>
                    {currentUser && currentUser.id !== u.id && (
                      <button
                        onClick={() => handleDeleteClick(u.id)}
                        className="px-3 py-1.5 border-2 border-black bg-error text-on-error font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-md relative animate-slide-up">
            <Card className="p-6 relative max-h-[85vh] flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#caf300] shrink-0" />
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="font-display text-xl font-black uppercase tracking-tight">
                  {modalType === 'add' ? 'Add New User' : 'Edit User'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="font-mono text-sm font-black border-2 border-black w-6 h-6 flex items-center justify-center hover:bg-[#caf300] transition-colors"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div className="bg-error-container border-2 border-black p-2 mb-4 animate-shake shrink-0">
                  <p className="font-mono text-[10px] text-on-error-container">{modalError}</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
                <Input
                  label="Name"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label={modalType === 'add' ? "Password" : "Password (leave blank to keep current)"}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={modalType === 'add'}
                />
                <Input
                  label="City"
                  placeholder="e.g. Jakarta"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md uppercase text-on-surface-variant">
                    Role
                  </label>
                  <select
                    className="border-4 border-black bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-neo placeholder:text-outline focus:border-primary focus:shadow-neo focus:-translate-y-[1px]"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>

                <Input
                  label="Avatar URL (Optional)"
                  placeholder="e.g. https://example.com/avatar.jpg"
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                />

                <div className="pt-2 flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-1/2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-1/2"
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
