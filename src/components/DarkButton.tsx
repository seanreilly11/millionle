export function DarkButton({
  fullWidth,
  className,
  children,
  ...props
}: {
  fullWidth?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = `bg-ink text-white font-extrabold rounded-xl text-sm py-3.5 px-6 focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none${fullWidth ? " w-full" : ""}`;
  return (
    <button
      className={className ? `${base} ${className}` : base}
      {...props}
    >
      {children}
    </button>
  );
}
