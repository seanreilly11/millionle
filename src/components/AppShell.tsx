export function AppShell({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`max-w-app mx-auto min-h-svh flex flex-col pt-8 px-6 pb-6 relative overflow-hidden${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
      <footer className="mt-auto pt-4 text-center">
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-steel">©</span>
            <span className="font-mono text-xs text-steel">2026</span>
          </div>
          <a
            href="/privacy"
            className="font-mono text-xs text-steel hover:text-ink tracking-wide"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="font-mono text-xs text-steel hover:text-ink tracking-wide"
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
