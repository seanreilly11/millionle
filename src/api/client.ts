import type { GameApi } from "./types";
import { mockApi } from "./mockApi";

// Swap to httpApi here when the real backend exists.
export function getApi(): GameApi {
  return mockApi;
}
