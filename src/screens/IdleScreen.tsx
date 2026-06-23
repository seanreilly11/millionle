import { GuessInput } from "../components/GuessInput";

export function IdleScreen({
  puzzle,
  onGuess,
}: {
  puzzle: number;
  onGuess: (guess: number) => void;
}) {
  return (
    <div className="app">
      <div className="row">
        <div className="mark">
          MILLI<span className="o">O</span>NLE
        </div>
        <div className="puzzle">No. {puzzle}</div>
      </div>
      <div className="tagc">
        <p>
          One hidden number, <b>1 to 1,000,000</b>.
        </p>
        <p>One guess — can you get it?</p>
      </div>
      <div className="hero">
        <GuessInput onSubmit={onGuess} />
      </div>
    </div>
  );
}
