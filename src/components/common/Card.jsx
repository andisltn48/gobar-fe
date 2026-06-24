export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-surface-container-lowest border-4 border-black transition-neo ${
        hover
          ? 'neo-shadow hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-heavy cursor-pointer active:translate-x-0 active:translate-y-0 active:shadow-none'
          : 'neo-shadow'
      } ${className}`}
    >
      {children}
    </div>
  );
}
