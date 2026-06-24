import { useState } from "react";
import { DarkButton } from "./DarkButton";

export function JoinBoard({ defaultName, onJoin }: { defaultName: string; onJoin: (name: string) => void }) {
  const [name, setName] = useState(defaultName);
  const clean = name.trim().slice(0, 20);
  return (
    <div className="mt-auto border-t border-line pt-4">
      <div className="flex gap-2.5 items-stretch mt-2.5">
        <input
          className="flex-1 border-2 border-line2 rounded-xl bg-card2 px-3.5 py-3 font-semibold text-base text-ink font-num"
          aria-label="Your name"
          placeholder="Your name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
        <DarkButton disabled={clean.length === 0} onClick={() => onJoin(clean)}>
          Join board
        </DarkButton>
      </div>
    </div>
  );
}
