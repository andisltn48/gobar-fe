import Swal from 'sweetalert2';

const NeoSwal = Swal.mixin({
  customClass: {
    popup: 'border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#f9fbe5] text-[#1a1d10] font-body',
    title: 'font-display font-black uppercase text-xl text-[#1a1d10] border-b-4 border-black pb-3',
    htmlContainer: 'font-body text-sm text-[#444932] pt-4',
    confirmButton: 'px-6 py-3 font-label text-label-md uppercase tracking-wider transition-neo border-4 border-black bg-[#caf300] text-[#171e00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none mx-2 cursor-pointer',
    cancelButton: 'px-6 py-3 font-label text-label-md uppercase tracking-wider transition-neo border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none mx-2 cursor-pointer',
  },
  buttonsStyling: false,
});

export function showAlert(title, text, icon = 'info') {
  return NeoSwal.fire({
    title,
    text,
    icon,
  });
}

export function showSuccess(title, text) {
  return NeoSwal.fire({
    title,
    text,
    icon: 'success',
  });
}

export function showError(title, text) {
  return NeoSwal.fire({
    title,
    text,
    icon: 'error',
  });
}

export async function showConfirm(title, text, confirmText = 'YA', cancelText = 'BATAL') {
  const result = await NeoSwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
}
