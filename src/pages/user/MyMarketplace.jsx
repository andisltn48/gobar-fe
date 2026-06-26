import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../hooks/useMarketplace';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import api, { extractError } from '../../services/api';
import { showSuccess, showError, showConfirm } from '../../utils/alert';

export default function MyMarketplace() {
  const { myItems, loading, error, fetchMyItems, updateItem, deleteItem } = useMarketplace(false);

  // Modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [formError, setFormError] = useState('');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const handleStartEdit = (item) => {
    setSelectedItem(item);
    setTitle(item.title);
    setPrice(item.price.toString());
    setDescription(item.description);
    setPhotos(item.photos || []);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setFormError('');

    try {
      const uploadedUrls = [...photos];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          showError('FILE TOO LARGE', `File ${file.name} exceeds 10MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        }
      }
      setPhotos(uploadedUrls);
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await updateItem(selectedItem.id, {
        title: title.trim(),
        price: parseFloat(price) || 0,
        description: description.trim(),
        photos: photos,
      });

      showSuccess(
        'BARANG DI-UPDATE',
        'Postingan jualan Anda berhasil diperbarui dan sedang menunggu re-review Admin!'
      );
      setIsEditModalOpen(false);
      fetchMyItems();
    } catch (err) {
      setFormError(err.message || 'Gagal memperbarui postingan jualan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async (id, itemTitle) => {
    const confirmed = await showConfirm(
      'HAPUS BARANG',
      `Apakah Anda yakin ingin menghapus "${itemTitle}" dari marketplace?`
    );
    if (!confirmed) return;

    try {
      await deleteItem(id);
      showSuccess('TERHAPUS', 'Barang jualan berhasil dihapus.');
      fetchMyItems();
    } catch (err) {
      showError('GAGAL', err.message || 'Gagal menghapus barang jualan');
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-[#caf300] text-[#171e00] border-2 border-black px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            DISETUJUI
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-error text-on-error border-2 border-black px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            DITOLAK
          </span>
        );
      default:
        return (
          <span className="bg-[#fff88c] text-black border-2 border-black px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            MENUNGGU REVIEW
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <div className="flex items-end gap-4 mb-2">
            <h1 className="page-header">BARANG SAYA</h1>
            <span className="neo-stamp mb-2">
              <i className="fa-solid fa-bicycle text-[12px]" /> Marketplace
            </span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant uppercase">
            Kelola barang-barang sepeda yang Anda jual di marketplace
          </p>
        </div>
        <Link to="/marketplace">
          <Button variant="ghost">
            <i className="fa-solid fa-arrow-left mr-2" /> Catalog
          </Button>
        </Link>
      </div>

      <div className="neo-divider" />

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-label-md text-on-error-container">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : myItems.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <p className="font-display text-2xl text-primary font-black uppercase mb-2">
            Belum Ada Barang
          </p>
          <p className="font-body text-sm text-on-surface-variant mb-6">
            Anda belum pernah memposting barang jualan di marketplace.
          </p>
          <Link to="/marketplace">
            <Button>Mulai Jual Barang</Button>
          </Link>
        </Card>
      ) : (
        <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#536600] border-b-4 border-black text-white font-mono text-xs uppercase tracking-wider">
                <th className="p-4 border-r-4 border-black">Photo</th>
                <th className="p-4 border-r-4 border-black">Title</th>
                <th className="p-4 border-r-4 border-black">Price</th>
                <th className="p-4 border-r-4 border-black">Status</th>
                <th className="p-4 border-r-4 border-black">Description</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black font-body text-sm text-on-surface">
              {myItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#caf300]/10 transition-colors">
                  <td className="p-4 border-r-4 border-black shrink-0">
                    <div className="w-12 h-12 border-2 border-black overflow-hidden bg-gray-100">
                      {item.photos && item.photos.length > 0 ? (
                        <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#caf300]/10">
                          <i className="fa-solid fa-image text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-r-4 border-black font-semibold truncate max-w-[150px]" title={item.title}>
                    <Link to={`/marketplace/${item.id}`} className="hover:underline text-primary">
                      {item.title}
                    </Link>
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs uppercase text-[#d73b00] font-bold">
                    {formatPrice(item.price)}
                  </td>
                  <td className="p-4 border-r-4 border-black">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-4 border-r-4 border-black font-body text-xs truncate max-w-[200px]" title={item.description}>
                    {item.description}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="px-3 py-1.5 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300]/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer flex items-center gap-1"
                    >
                      <i className="fa-solid fa-pen-to-square" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="px-3 py-1.5 border-2 border-black bg-error text-on-error font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer flex items-center gap-1"
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative animate-slide-up">
            <Card className="p-6 relative max-h-[85vh] flex flex-col bg-[#f4f5df]">
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#caf300] shrink-0" />

              <div className="flex justify-between items-center mb-6 shrink-0 border-b-2 border-black pb-3">
                <h3 className="font-display text-xl font-black uppercase text-black">
                  Edit Barang Jualan
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="font-mono text-sm font-black border-2 border-black w-6 h-6 flex items-center justify-center hover:bg-[#caf300] transition-colors"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="bg-error-container border-2 border-black p-2 mb-4 animate-shake shrink-0">
                  <p className="font-mono text-[10px] text-on-error-container">{formError}</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
                <Input
                  label="Nama Barang"
                  placeholder="e.g. Sepeda Roadbike Polygon Helios A8"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Input
                  label="Harga (IDR)"
                  type="number"
                  placeholder="e.g. 15000000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md uppercase text-on-surface-variant font-bold">
                    Deskripsi Barang
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Jelaskan kondisi barang, spesifikasi, minus dsb..."
                    className="border-4 border-black bg-white px-4 py-3 font-body text-body-md text-on-surface outline-none transition-neo placeholder:text-outline focus:border-primary focus:shadow-neo focus:-translate-y-[1px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Upload Photos Section */}
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label-md uppercase text-on-surface-variant font-bold">
                    Foto Barang (Bisa Upload Multiple)
                  </label>
                  
                  {/* Photo Thumbnails Preview */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-2">
                      {photos.map((url, idx) => (
                        <div key={idx} className="w-20 h-20 border-2 border-black relative overflow-hidden group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="marketplace-edit-photo-input"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhotos}
                    />
                    <label
                      htmlFor="marketplace-edit-photo-input"
                      className={`w-full py-4 border-4 border-black border-dashed flex flex-col justify-center items-center text-center cursor-pointer transition-colors ${
                        uploadingPhotos ? 'bg-gray-100 opacity-50' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {uploadingPhotos ? (
                        <>
                          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="font-mono text-[10px] font-bold uppercase">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-camera text-xl text-black/50 mb-1" />
                          <span className="font-mono text-[10px] font-bold uppercase">Upload Foto Baru</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-4 border-t border-black/10 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-1/2"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-1/2"
                    disabled={formLoading || uploadingPhotos}
                  >
                    {formLoading ? 'Saving...' : 'Save Changes'}
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
