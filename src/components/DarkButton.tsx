export function DarkButton({
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...props
}: {
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = `bg-ink text-white font-extrabold rounded-xl text-sm py-3.5 px-6 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none${fullWidth ? " w-full" : ""}`;
  return (
    <button
      className={className ? `${base} ${className}` : base}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="loading-dots inline-flex gap-1" aria-label="Joining">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
