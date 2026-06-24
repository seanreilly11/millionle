export function AppShell({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`max-w-app mx-auto min-h-dvh flex flex-col pt-8 px-6 pb-6 relative overflow-hidden${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </div>
  );
}
