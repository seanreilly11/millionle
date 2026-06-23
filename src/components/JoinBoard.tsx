import { useState } from "react";

export function JoinBoard({ defaultName, onJoin }: { defaultName: string; onJoin: (name: string) => void }) {
  const [name, setName] = useState(defaultName);
  const clean = name.trim().slice(0, 20);
  return (
    <div className="join">
      <div className="namewrap">
        <input aria-label="Your name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
        <button className="go" disabled={clean.length === 0} onClick={() => onJoin(clean)}>Join board</button>
      </div>
    </div>
  );
}
