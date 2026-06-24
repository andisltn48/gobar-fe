export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'relative px-6 py-3 font-label text-label-md uppercase tracking-wider transition-neo border-4 border-black disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary-container text-on-primary-container neo-shadow hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-neo-heavy active:translate-x-0 active:translate-y-0 active:shadow-none',
    secondary:
      'bg-primary-fixed text-on-primary-fixed neo-shadow hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-neo-heavy active:translate-x-0 active:translate-y-0 active:shadow-none',
    danger:
      'bg-error text-on-error neo-shadow hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-neo-heavy active:translate-x-0 active:translate-y-0 active:shadow-none',
    ghost:
      'bg-surface-container-lowest text-on-surface hover:bg-surface-variant neo-shadow hover:-translate-y-[1px] hover:-translate-x-[1px] active:translate-x-0 active:translate-y-0 active:shadow-none',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
