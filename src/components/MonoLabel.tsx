type LabelSize = "sm" | "md";

export function MonoLabel({
  size = "md",
  tracking = "tracking-label",
  children,
}: {
  size?: LabelSize;
  tracking?: string;
  children: React.ReactNode;
}) {
  const sz = size === "sm" ? "text-2xs" : "text-label";
  return (
    <div className={`font-mono ${sz} ${tracking} text-steel uppercase`}>
      {children}
    </div>
  );
}
