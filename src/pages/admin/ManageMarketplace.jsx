import { useEffect, useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { showSuccess, showError, showConfirm } from '../../utils/alert';

export default function ManageMarketplace() {
  const {
    pendingItems,
    items,
    rejectedItems,
    loading,
    error,
    reviewItem,
    fetchPending,
    fetchApproved,
    fetchRejected
  } = useMarketplace(false);

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleOpenDetailModal = (item) => {
    setSelectedDetailItem(item);
    setActivePhotoIdx(0);
  };

  useEffect(() => {
    fetchPending();
    fetchApproved();
    fetchRejected();
  }, [fetchPending, fetchApproved, fetchRejected]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleReviewAction = async (id, title, status) => {
    const actionText = status === 'approved' ? 'menyetujui' : 'menolak';
    const confirmed = await showConfirm(
      'REVIEW BARANG',
      `Apakah Anda yakin ingin ${actionText} postingan "${title}"?`
    );
    if (!confirmed) return;

    try {
      setLocalError('');
      setSuccessMessage('');
      await reviewItem(id, status);
      setSuccessMessage(`Postingan "${title}" berhasil di-${status}!`);
      // Refetch all to keep counts updated
      fetchPending();
      fetchApproved();
      fetchRejected();
    } catch (err) {
      setLocalError(err.message || 'Gagal melakukan review barang');
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
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <div className="flex items-end gap-4 mb-2">
            <h1 className="page-header">Marketplace</h1>
            <span className="neo-stamp mb-2">
              <i className="fa-solid fa-store text-[12px]" /> Moderation
            </span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant uppercase">
            Review dan moderasi barang jualan komunitas sepeda
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        {['pending', 'approved', 'rejected'].map((tab) => {
          const count =
            tab === 'pending'
              ? pendingItems.length
              : tab === 'approved'
              ? items.length
              : rejectedItems.length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 border-4 border-black font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                activeTab === tab
                  ? 'bg-[#caf300] text-[#171e00] translate-y-[-2px] translate-x-[-2px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-gray-50 active:translate-y-0 active:translate-x-0 active:shadow-none'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (activeTab === 'pending' ? pendingItems : activeTab === 'approved' ? items : rejectedItems).length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <p className="font-display text-2xl text-primary font-black uppercase mb-2">
            No {activeTab} Items
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            {activeTab === 'pending'
              ? 'Semua barang jualan di marketplace telah di-review. Tidak ada antrean baru.'
              : activeTab === 'approved'
              ? 'Belum ada barang jualan yang disetujui.'
              : 'Tidak ada barang jualan yang ditolak.'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#536600] border-b-4 border-black text-white font-mono text-xs uppercase tracking-wider">
                <th className="p-4 border-r-4 border-black">Photo</th>
                <th className="p-4 border-r-4 border-black">Title</th>
                <th className="p-4 border-r-4 border-black">Price</th>
                <th className="p-4 border-r-4 border-black">Seller</th>
                <th className="p-4 border-r-4 border-black">Description</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black font-body text-sm text-on-surface">
              {(activeTab === 'pending' ? pendingItems : activeTab === 'approved' ? items : rejectedItems).map((item) => (
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
                    {item.title}
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs uppercase text-[#d73b00] font-bold">
                    {formatPrice(item.price)}
                  </td>
                  <td className="p-4 border-r-4 border-black font-mono text-xs">
                    <div>{item.user?.name || 'Rider'}</div>
                    <div className="text-[10px] text-gray-500">{item.user?.city}</div>
                  </td>
                  <td className="p-4 border-r-4 border-black font-body text-xs truncate max-w-[200px]" title={item.description}>
                    {item.description}
                  </td>
                  <td className="p-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenDetailModal(item)}
                      className="px-3 py-1.5 border-2 border-black bg-white text-black font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer flex items-center gap-1"
                    >
                      <i className="fa-solid fa-eye" /> Detail
                    </button>
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewAction(item.id, item.title, 'approved')}
                        className="px-3 py-1.5 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300]/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        onClick={() => handleReviewAction(item.id, item.title, 'rejected')}
                        className="px-3 py-1.5 border-2 border-black bg-error text-on-error font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl relative animate-slide-up">
            <Card className="p-6 relative max-h-[85vh] flex flex-col bg-[#f4f5df]">
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#caf300] shrink-0" />

              <div className="flex justify-between items-center mb-6 shrink-0 border-b-2 border-black pb-3">
                <h3 className="font-display text-xl font-black uppercase text-black">
                  Detail Barang Jualan (Review)
                </h3>
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="font-mono text-sm font-black border-2 border-black w-6 h-6 flex items-center justify-center hover:bg-[#caf300] transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto pr-2 flex-1 space-y-6">
                {/* Images Slideshow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative aspect-square overflow-hidden flex items-center justify-center">
                      {selectedDetailItem.photos && selectedDetailItem.photos.length > 0 ? (
                        <img
                          src={selectedDetailItem.photos[activePhotoIdx]}
                          alt=""
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setIsLightboxOpen(true)}
                        />
                      ) : (
                        <i className="fa-solid fa-bicycle text-6xl text-black/10" />
                      )}

                      {/* Slideshow Arrows */}
                      {selectedDetailItem.photos && selectedDetailItem.photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePhotoIdx((prev) =>
                                prev === 0 ? selectedDetailItem.photos.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-[#caf300] active:scale-95 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <i className="fa-solid fa-chevron-left text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePhotoIdx((prev) =>
                                prev === selectedDetailItem.photos.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-[#caf300] active:scale-95 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <i className="fa-solid fa-chevron-right text-xs" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Slideshow Thumbnails */}
                    {selectedDetailItem.photos && selectedDetailItem.photos.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedDetailItem.photos.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-12 h-12 border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all ${
                              idx === activePhotoIdx ? 'border-primary scale-95' : 'border-black opacity-70'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-mono text-[10px] font-black uppercase text-gray-500">Nama Barang</h4>
                      <h2 className="font-display text-lg font-black uppercase text-black leading-tight">
                        {selectedDetailItem.title}
                      </h2>
                    </div>

                    <div>
                      <h4 className="font-mono text-[10px] font-black uppercase text-gray-500">Harga</h4>
                      <p className="font-mono text-lg text-[#d73b00] font-black">
                        {formatPrice(selectedDetailItem.price)}
                      </p>
                    </div>

                    <div className="border-t-2 border-black/10 pt-3">
                      <h4 className="font-mono text-[10px] font-black uppercase text-gray-500 mb-2">Penjual</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-bold text-xs bg-[#caf300]">
                          {selectedDetailItem.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-mono text-xs font-black uppercase text-black">
                            {selectedDetailItem.user?.name}
                          </div>
                          <div className="font-mono text-[9px] text-gray-500 uppercase">
                            Kota: {selectedDetailItem.user?.city} | WA: {selectedDetailItem.user?.contact || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-black/10 pt-4 space-y-2">
                  <h4 className="font-mono text-[10px] font-black uppercase text-gray-500">Deskripsi Barang</h4>
                  <p className="font-body text-xs text-on-surface leading-relaxed whitespace-pre-line border-l-4 border-black pl-3 bg-white p-3 border-2 border-black/10">
                    {selectedDetailItem.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-4 flex gap-4 border-t border-black/10 shrink-0 mt-6">
                <Button
                  variant="ghost"
                  className={selectedDetailItem.status === 'pending' ? "w-1/3" : "w-1/2"}
                  onClick={() => setSelectedDetailItem(null)}
                >
                  Close
                </Button>
                {selectedDetailItem.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleReviewAction(selectedDetailItem.id, selectedDetailItem.title, 'rejected');
                      setSelectedDetailItem(null);
                    }}
                    className={`${selectedDetailItem.status === 'pending' ? "w-1/3" : "w-1/2"} py-2 border-2 border-black bg-error text-on-error font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 active:translate-y-0.5 transition-all cursor-pointer`}
                  >
                    Reject
                  </button>
                )}
                {selectedDetailItem.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleReviewAction(selectedDetailItem.id, selectedDetailItem.title, 'approved');
                      setSelectedDetailItem(null);
                    }}
                    className={`${selectedDetailItem.status === 'pending' ? "w-1/3" : "w-1/2"} py-2 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#b0d500] active:translate-y-0.5 transition-all cursor-pointer`}
                  >
                    Approve
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedDetailItem && selectedDetailItem.photos && selectedDetailItem.photos.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[400] flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-black border-2 border-white w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black transition-colors z-[410] cursor-pointer"
          >
            ✕
          </button>
          
          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img
              src={selectedDetailItem.photos[activePhotoIdx]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl"
            />

            {/* Lightbox Navigation */}
            {selectedDetailItem.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === 0 ? selectedDetailItem.photos.length - 1 : prev - 1
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
                      prev === selectedDetailItem.photos.length - 1 ? 0 : prev + 1
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
