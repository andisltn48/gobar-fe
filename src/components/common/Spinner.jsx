export default function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-5 w-5 border-[3px]',
    md: 'h-9 w-9 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div
        className={`${sizes[size] || sizes.md} animate-spin border-on-surface border-t-primary-container`}
        style={{ borderRadius: '9999px' }}
      />
    </div>
  );
}
