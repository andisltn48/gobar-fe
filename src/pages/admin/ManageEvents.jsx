import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { useEvents } from '../../hooks/useEvent';
import { showSuccess, showError, showConfirm } from '../../utils/alert';

export default function ManageEvents() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent, refetch } = useEvents('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    schedule: '',
    route_details: '',
    contact: '',
  });

  // Helper to convert ISO string to YYYY-MM-DDTHH:MM
  const formatDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleAddClick = () => {
    setForm({
      title: '',
      description: '',
      city: '',
      schedule: '',
      route_details: '',
      contact: '',
    });
    setModalType('add');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEditClick = (event) => {
    setForm({
      title: event.title,
      description: event.description || '',
      city: event.city,
      schedule: formatDatetimeLocal(event.schedule),
      route_details: event.route_details || '',
      contact: event.contact || '',
    });
    setSelectedEventId(event.id);
    setModalType('edit');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = await showConfirm(
      'HAPUS EVENT',
      'Apakah Anda yakin ingin menghapus event ini?'
    );
    if (!confirmed) return;

    try {
      setLocalError('');
      setSuccessMessage('');
      await deleteEvent(id);
      setSuccessMessage('Event berhasil dihapus!');
      refetch();
    } catch (err) {
      setLocalError(err.message || 'Gagal menghapus event');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    // Convert local schedule to ISO String
    const formattedData = {
      ...form,
      schedule: form.schedule ? new Date(form.schedule).toISOString() : '',
    };

    try {
      if (modalType === 'add') {
        await createEvent(formattedData);
        setSuccessMessage('Event baru berhasil dibuat!');
      } else {
        await updateEvent(selectedEventId, formattedData);
        setSuccessMessage('Event berhasil diperbarui!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      setModalError(err.message || 'Terjadi kesalahan saat menyimpan event');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDisplayDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <div className="flex items-end gap-4 mb-2">
            <h1 className="page-header">Events</h1>
            <span className="neo-stamp mb-2">
              🗓 Manage
            </span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant uppercase">
            Kelola data event gowes bareng komunitas
          </p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          Add Event
        </Button>
      </div>

      <div className="neo-divider" />

      {successMessage && (
        <div className="bg-[#caf300] border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-label-md text-on-primary-fixed flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="font-black hover:opacity-75">✕</button>
        </div>
      )}

      {(error || localError) && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake font-mono text-label-md text-on-error-container flex justify-between items-center">
          <span>{error || localError}</span>
          <button onClick={() => setLocalError('')} className="font-black hover:opacity-75">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-display text-2xl text-primary font-black uppercase mb-2">
            No Events Found
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Belum ada event gowes yang terjadwal.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#536600] border-b-4 border-black text-white font-mono text-xs uppercase tracking-wider">
                <th className="p-4 border-r-4 border-black">Title</th>
                <th className="p-4 border-r-4 border-black">City</th>
                <th className="p-4 border-r-4 border-black">Schedule</th>
                <th className="p-4 border-r-4 border-black">Route Details</th>
                <th className="p-4 border-r-4 border-black">Contact</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black font-body text-sm text-on-surface">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#caf300]/10 transition-colors">
                  <td className="p-4 border-r-4 border-black font-semibold truncate max-w-[150px]">
                    {ev.title}
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs uppercase">{ev.city}</td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs">
                    {formatDisplayDate(ev.schedule)}
                  </td>
                  <td className="p-4 border-r-4 border-black font-body text-xs truncate max-w-[150px]" title={ev.route_details}>
                    {ev.route_details || '-'}
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs truncate max-w-[120px]" title={ev.contact}>
                    {ev.contact || '-'}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(ev)}
                      className="px-3 py-1.5 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300]/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ev.id)}
                      className="px-3 py-1.5 border-2 border-black bg-error text-on-error font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-md relative animate-slide-up">
            <Card className="p-6 relative max-h-[85vh] flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#caf300] shrink-0" />
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="font-display text-xl font-black uppercase tracking-tight">
                  {modalType === 'add' ? 'Add New Event' : 'Edit Event'}
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
                  label="Event Title"
                  placeholder="e.g. Jakarta Morning Ride"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md uppercase text-on-surface-variant">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what the ride is about..."
                    className="border-4 border-black bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-neo placeholder:text-outline focus:border-primary focus:shadow-neo focus:-translate-y-[1px]"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <Input
                  label="City"
                  placeholder="e.g. Jakarta"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />

                <Input
                  label="Schedule (Date & Time)"
                  type="datetime-local"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md uppercase text-on-surface-variant">
                    Route Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Monas -> Senayan -> BSD City"
                    className="border-4 border-black bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-neo placeholder:text-outline focus:border-primary focus:shadow-neo focus:-translate-y-[1px]"
                    value={form.route_details}
                    onChange={(e) => setForm({ ...form, route_details: e.target.value })}
                  />
                </div>

                <Input
                  label="Contact (WhatsApp Number)"
                  placeholder="e.g. 628123456789"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  required
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
