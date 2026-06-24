export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-label text-label-md uppercase text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        className={`border-4 border-black bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-neo placeholder:text-outline focus:border-primary focus:shadow-neo focus:-translate-y-[1px] ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="font-mono text-label-sm text-error uppercase tracking-wider">
          {error}
        </span>
      )}
    </div>
  );
}
