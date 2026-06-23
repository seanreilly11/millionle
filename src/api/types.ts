import type { TierId } from "../engine/score";
import type { Stats } from "../engine/stats";

export interface GuessRequest { uuid: string; guess: number; offset: number; }
export interface GuessResponse {
  score: number;
  distance: number;
  answer: number;
  rank: number;
  alreadyPlayed: boolean;
  hasJoined: boolean;
  tier: TierId;
  date: string;
  puzzle: number;
  stats: Stats;
}

export interface NameRequest { uuid: string; name: string; offset: number; }
export interface NameResponse { ok: true; rank: number; }

export interface LeaderboardRequest { date?: string; limit?: number; uuid?: string; offset?: number; }
export interface LeaderboardEntry { rank: number; name: string; score: number; isMe: boolean; }
export interface LeaderboardResponse { date: string; entries: LeaderboardEntry[]; myRank: number | null; }

export interface GameApi {
  guess(req: GuessRequest): Promise<GuessResponse>;
  submitName(req: NameRequest): Promise<NameResponse>;
  leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse>;
}
