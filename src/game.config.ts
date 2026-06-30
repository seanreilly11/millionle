import type { GameConfig } from "./engine/types";

export const SITE_URL = "https://millionle.com/";
export const SITE_URL_SHORT = "millionle.com";

export const MILLIONLE: GameConfig = {
  name: "millionle",
  mode: "number",
  min: 1,
  max: 1_000_000,
  guesses: 1,
  launch: "2026-06-23",
};
