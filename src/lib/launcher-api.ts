export const API_BASE = "http://localhost:8000";
export const WS_LOGS_URL = "ws://localhost:8000/ws/logs";

export type LauncherConfig = {
  mode: string;
  army: string;
  loot: number;
  storage: number;
  toggles: Record<string, boolean>;
};

export type SessionStats = {
  gold: number;
  elixir: number;
  attacks: number;
  walls: number;
  timeElapsed: string;
};

export type LogType = "info" | "action" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  message: string;
  type: LogType;
};

export const CONFIG_STORAGE_KEY = "clash-farm.config";

export const emptyStats: SessionStats = {
  gold: 0,
  elixir: 0,
  attacks: 0,
  walls: 0,
  timeElapsed: "0m",
};

export function formatTime(date = new Date()) {
  return date.toTimeString().slice(0, 8);
}

export function logColor(type: LogType) {
  switch (type) {
    case "action":
      return "text-terminal-purple";
    case "warn":
      return "text-session-gold";
    case "error":
      return "text-destructive";
    default:
      return "text-terminal-green";
  }
}

export function normalizeLog(raw: unknown): LogEntry {
  if (typeof raw === "string") {
    return { timestamp: formatTime(), message: raw, type: "info" };
  }
  const entry = (raw ?? {}) as Partial<LogEntry> & { time?: string; text?: string };
  return {
    timestamp: entry.timestamp ?? entry.time ?? formatTime(),
    message: entry.message ?? entry.text ?? "",
    type: (entry.type as LogType) ?? "info",
  };
}

export function normalizeStats(raw: unknown): SessionStats {
  const data = (raw ?? {}) as Record<string, unknown>;
  const num = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);
  return {
    gold: num(data['gold']),
    elixir: num(data['elixir']),
    attacks: num(data['attacks'] ?? data['attack']),
    walls: num(data['walls'] ?? data['wall']),
    timeElapsed: String(data['timeElapsed'] ?? data['time_elapsed'] ?? "0m"),
  };
}
