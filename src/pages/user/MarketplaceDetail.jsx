import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { extractError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { showError, showConfirm, showSuccess } from '../../utils/alert';

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/marketplace/${id}`);
        setItem(res.data.data);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDeleteItem = async () => {
    const confirmed = await showConfirm(
      'HAPUS BARANG',
      'Apakah Anda yakin ingin menghapus barang jualan ini? Tindakan ini tidak dapat dibatalkan.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/marketplace/${id}`);
      showSuccess('BARANG DIHAPUS', 'Barang jualan berhasil dihapus dari marketplace.');
      navigate('/marketplace');
    } catch (err) {
      showError('GAGAL HAPUS', extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleContactSeller = () => {
    if (!item?.user?.contact) {
      showError(
        'KONTAK TIDAK TERSEDIA',
        'Penjual belum mengonfigurasi nomor WhatsApp di profil mereka.'
      );
      return;
    }

    let cleanContact = item.user.contact.replace(/\D/g, '');
    if (cleanContact.startsWith('0')) {
      cleanContact = '62' + cleanContact.slice(1);
    }

    if (!cleanContact) {
      showError('KONTAK TIDAK VALID', 'Nomor kontak penjual tidak dapat diproses.');
      return;
    }

    const currentUrl = window.location.href;
    const message = `Apakah ini tersedia? ${currentUrl}`;
    const waUrl = `https://wa.me/${cleanContact}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="p-8 text-center bg-white">
          <p className="font-display text-2xl text-error font-black uppercase mb-4">
            Gagal Memuat Detail
          </p>
          <p className="font-body text-sm text-on-surface-variant mb-6">
            {error || 'Barang tidak ditemukan.'}
          </p>
          <Link to="/marketplace">
            <Button variant="ghost">Kembali ke Marketplace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user && item.user_id === user.id;
  const isAdmin = user && user.role === 'admin';
  const showPhotos = item.photos && item.photos.length > 0;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link to="/marketplace">
          <Button variant="ghost" className="px-4 py-2 text-xs font-mono font-bold uppercase">
            <i className="fa-solid fa-arrow-left mr-2" /> KEMBALI KE MARKETPLACE
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side: Photo Carousel/Viewer */}
        <div className="space-y-4">
          <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative aspect-square overflow-hidden flex items-center justify-center">
            {showPhotos ? (
              <img
                src={item.photos[activePhotoIdx]}
                alt=""
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              />
            ) : (
              <i className="fa-solid fa-bicycle text-8xl text-black/10" />
            )}

            {/* Slider arrows */}
            {showPhotos && item.photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === 0 ? item.photos.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-[#caf300] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === item.photos.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-[#caf300] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {showPhotos && item.photos.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {item.photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-16 h-16 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all ${
                    idx === activePhotoIdx ? 'border-primary scale-95' : 'border-black opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and Description */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="bg-[#7df4ff] text-black border-2 border-black px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {item.status === 'approved' ? 'DISETUJUI' : 'MENUNGGU REVIEW'}
              </span>
              <h2 className="font-display text-xl sm:text-3xl font-black uppercase text-black mt-3 leading-tight">
                {item.title}
              </h2>
              <p className="font-mono text-2xl text-[#d73b00] font-black mt-2">
                {formatPrice(item.price)}
              </p>
            </div>

            <Card className="p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-black overflow-hidden bg-gray-200 shrink-0">
                  {item.user?.avatar_url ? (
                    <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-black uppercase bg-[#caf300]">
                      {item.user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-mono text-xs font-black uppercase text-black">
                    PENJUAL: {item.user?.name}
                  </div>
                  <div className="font-mono text-[10px] text-gray-500 uppercase">
                    KOTA: {item.user?.city}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <h4 className="font-mono text-[10px] font-black uppercase tracking-wider text-gray-500">
                Deskripsi Barang
              </h4>
              <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-line border-l-4 border-black pl-4">
                {item.description}
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <button
              onClick={handleContactSeller}
              className="w-full py-4 border-4 border-black bg-[#caf300] text-[#171e00] font-label text-sm font-black uppercase tracking-widest shadow-neo hover:bg-[#b0d500] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-75 flex justify-center items-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-lg" /> HUBUNGI PENJUAL
            </button>

            {(isOwner || isAdmin) && (
              <button
                onClick={handleDeleteItem}
                disabled={deleting}
                className="w-full py-2 border-2 border-black bg-error text-on-error font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 active:translate-y-0.5 transition-all"
              >
                {deleting ? 'DELETING...' : 'HAPUS BARANG JUALAN'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && showPhotos && (
        <div className="fixed inset-0 bg-black/95 z-[400] flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-black border-2 border-white w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black transition-colors z-[410] cursor-pointer"
          >
            ✕
          </button>
          
          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img
              src={item.photos[activePhotoIdx]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl"
            />

            {/* Lightbox Navigation */}
            {item.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === 0 ? item.photos.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black active:scale-95 transition-all shadow-lg z-[410]"
                >
                  <i className="fa-solid fa-chevron-left text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === item.photos.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black active:scale-95 transition-all shadow-lg z-[410]"
                >
                  <i className="fa-solid fa-chevron-right text-lg" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
