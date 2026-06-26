import { useEffect, useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { showSuccess, showError, showConfirm } from '../../utils/alert';

export default function ManageMarketplace() {
  const { pendingItems, loading, error, reviewItem, fetchPending } = useMarketplace(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

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

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : pendingItems.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <p className="font-display text-2xl text-primary font-black uppercase mb-2">
            No Pending Items
          </p>
          <p className="font-body text-sm text-on-surface-variant">
            Semua barang jualan di marketplace telah di-review. Tidak ada antrean baru.
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
              {pendingItems.map((item) => (
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
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleReviewAction(item.id, item.title, 'approved')}
                      className="px-3 py-1.5 border-2 border-black bg-[#caf300] text-[#171e00] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#caf300]/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewAction(item.id, item.title, 'rejected')}
                      className="px-3 py-1.5 border-2 border-black bg-error text-on-error font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-error/95 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-75 cursor-pointer"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
