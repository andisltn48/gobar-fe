import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import api, { extractError } from '../../services/api';
import { showSuccess, showError } from '../../utils/alert';

export default function Marketplace() {
  const { items, loading, error, createItem, fetchApproved } = useMarketplace(true);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]); // Array of strings (URLs)

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartSell = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setPhotos([]);
    setFormError('');
    setIsModalOpen(true);
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

    if (!user?.contact) {
      showError(
        'CONTACT REQUIRED',
        'Anda harus mengisi Nomor WhatsApp di Profile Anda sebelum dapat mengunggah barang di marketplace.'
      );
      setFormLoading(false);
      return;
    }

    try {
      await createItem({
        title: title.trim(),
        price: parseFloat(price) || 0,
        description: description.trim(),
        photos: photos,
      });

      showSuccess(
        'ITEM TERKIRIM',
        'Barang jualan Anda telah berhasil dikirim dan sedang menunggu persetujuan (review) Admin!'
      );
      setIsModalOpen(false);
      fetchApproved();
    } catch (err) {
      setFormError(err.message || 'Gagal membuat postingan jualan');
    } finally {
      setFormLoading(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-display-lg-mobile md:text-display-lg font-black uppercase tracking-tighter bg-[#caf300] text-[#171e00] inline-block border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">
            BIKE MARKETPLACE
          </h1>
          <p className="font-body text-sm sm:text-body-lg font-bold border-l-4 border-black pl-4 ml-2 uppercase">
            Jual Beli Sepeda & Gear Komunitas. Bersih, Cepat, Terpercaya.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {user && (
            <Link to="/marketplace/my-items" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full">
                <i className="fa-solid fa-list mr-2" /> Barang Saya
              </Button>
            </Link>
          )}
          <Button onClick={handleStartSell} className="w-full sm:w-auto">
            <i className="fa-solid fa-plus mr-2" /> Jual Barang
          </Button>
        </div>
      </div>

      <div className="neo-divider" />

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="CARI BARANG JUALAN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-4 border-black bg-white px-4 py-3 pl-12 font-mono text-sm uppercase text-black outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[-1px] focus:translate-x-[-1px] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 placeholder:text-gray-400"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/70">
          <i className="fa-solid fa-magnifying-glass text-lg" />
        </div>
      </div>

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
          <p className="font-mono text-label-md text-on-error-container">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <p className="font-display text-2xl text-[#006970] font-black uppercase mb-2">
            No Items Found
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Belum ada barang jualan yang terdaftar di marketplace saat ini. Jadilah yang pertama menjual barang Anda!
          </p>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <p className="font-display text-2xl text-[#006970] font-black uppercase mb-2">
            Tidak Ditemukan
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Tidak ada barang dengan nama "{searchQuery}" di marketplace saat ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/marketplace/${item.id}`}>
              <Card hover className="h-full flex flex-col overflow-hidden bg-white">
                {/* Photo Thumbnail */}
                <div className="h-56 border-b-4 border-black bg-[#e2e4cf] relative overflow-hidden flex items-center justify-center">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                  ) : (
                    <i className="fa-solid fa-bicycle text-4xl text-black/20" />
                  )}
                  <span className="absolute bottom-3 left-3 bg-[#006970] text-white border-2 border-black px-2 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {item.user?.city || 'UNKNOWN'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-md sm:text-lg font-black uppercase text-black line-clamp-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[#d73b00] text-md font-black mb-3">
                    {formatPrice(item.price)}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-3 mb-4 flex-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 border-t-2 border-black pt-3 mt-auto">
                    <div className="w-6 h-6 rounded-full border-2 border-black overflow-hidden bg-gray-200 shrink-0">
                      {item.user?.avatar_url ? (
                        <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black uppercase bg-[#caf300]">
                          {item.user?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-bold text-gray-700 uppercase truncate">
                      {item.user?.name}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Upload/Sell Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative animate-slide-up">
            <Card className="p-6 relative max-h-[85vh] flex flex-col bg-[#f4f5df]">
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#caf300] shrink-0" />

              <div className="flex justify-between items-center mb-6 shrink-0 border-b-2 border-black pb-3">
                <h3 className="font-display text-xl font-black uppercase text-black">
                  Mulai Jual Barang
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
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
                      id="marketplace-photo-input"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhotos}
                    />
                    <label
                      htmlFor="marketplace-photo-input"
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
                    onClick={() => setIsModalOpen(false)}
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
                    {formLoading ? 'Saving...' : 'Submit'}
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
