import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  API_BASE,
  CONFIG_STORAGE_KEY,
  WS_LOGS_URL,
  emptyStats,
  formatTime,
  normalizeLog,
  normalizeStats,
  type LauncherConfig,
  type LogEntry,
  type SessionStats,
} from "./launcher-api";

export const toggleLabels = [
  "Deploy Heroes Automatically",
  "Use Rage Spells",
  "Use Siege Machines",
  "Auto Upgrade Walls",
  "Stop When Storage Get Full",
  "Donate Troops Before Attack",
  "Ask For Donation Before Attack",
];

const defaultConfig: LauncherConfig = {
  mode: "home-village",
  army: "electric-dragon",
  loot: 500,
  storage: 27,
  toggles: Object.fromEntries(toggleLabels.map((label) => [label, true])),
};

type LauncherContextValue = {
  config: LauncherConfig;
  updateConfig: (patch: Partial<LauncherConfig>) => void;
  setToggle: (label: string, value: boolean) => void;
  devices: string[];
  selectedDevice: string | undefined;
  setSelectedDevice: (device: string) => void;
  isLoadingDevices: boolean;
  fetchDevices: () => Promise<void>;
  running: boolean;
  toggleRunning: () => Promise<void>;
  stats: SessionStats;
  logs: LogEntry[];
  clearLogs: () => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
};

const LauncherContext = createContext<LauncherContextValue | null>(null);

export function LauncherProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LauncherConfig>(defaultConfig);
  const [hydrated, setHydrated] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<SessionStats>(emptyStats);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted settings after hydration.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<LauncherConfig>;
        setConfig({
          ...defaultConfig,
          ...parsed,
          toggles: { ...defaultConfig.toggles, ...(parsed.toggles ?? {}) },
        });
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  // Persist + debounced push to the backend on any change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* storage unavailable */
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetch(`${API_BASE}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      }).catch(() => undefined);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config, hydrated]);

  const updateConfig = useCallback((patch: Partial<LauncherConfig>) => {
    setConfig((current) => ({ ...current, ...patch }));
  }, []);

  const setToggle = useCallback((label: string, value: boolean) => {
    setConfig((current) => ({ ...current, toggles: { ...current.toggles, [label]: value } }));
  }, []);

  const fetchDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      const response = await fetch(`${API_BASE}/api/devices`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as string[];
      setDevices(data);
      setSelectedDevice(data.length > 0 ? data[0] : undefined);
    } catch {
      setDevices([]);
      setSelectedDevice(undefined);
    } finally {
      setIsLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  const toggleRunning = useCallback(async () => {
    const next = !running;
    const endpoint = next ? "start" : "stop";
    setRunning(next);
    if (next) setStats(emptyStats);
    try {
      const response = await fetch(`${API_BASE}/api/bot/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: selectedDevice, config }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast.success(next ? "Bot started" : "Bot stopped");
    } catch {
      setRunning(!next);
      toast.error(`Failed to ${endpoint} the bot. Is the local backend running?`);
    }
  }, [running, selectedDevice, config]);

  // Poll session stats every 2s while running.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/stats`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setStats(normalizeStats(data));
      } catch {
        /* backend offline */
      }
    };
    void load();
    const id = setInterval(() => void load(), 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [running]);

  // Live logs: websocket with polling fallback.
  useEffect(() => {
    let socket: WebSocket | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let closed = false;

    const startPolling = () => {
      if (pollId || closed) return;
      const load = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/logs`);
          if (!response.ok) return;
          const data = (await response.json()) as unknown[];
          if (Array.isArray(data) && !closed) setLogs(data.map(normalizeLog));
        } catch {
          /* backend offline */
        }
      };
      void load();
      pollId = setInterval(() => void load(), 1000);
    };

    try {
      socket = new WebSocket(WS_LOGS_URL);
      socket.onmessage = (event) => {
        try {
          const parsed: unknown = JSON.parse(event.data as string);
          const entries = Array.isArray(parsed) ? parsed : [parsed];
          setLogs((current) => [...current, ...entries.map(normalizeLog)].slice(-500));
        } catch {
          setLogs((current) =>
            [...current, { timestamp: formatTime(), message: String(event.data), type: "info" as const }].slice(-500),
          );
        }
      };
      socket.onerror = () => startPolling();
      socket.onclose = () => startPolling();
    } catch {
      startPolling();
    }

    return () => {
      closed = true;
      if (pollId) clearInterval(pollId);
      socket?.close();
    };
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const value = useMemo(
    () => ({
      config,
      updateConfig,
      setToggle,
      devices,
      selectedDevice,
      setSelectedDevice: (device: string) => setSelectedDevice(device),
      isLoadingDevices,
      fetchDevices,
      running,
      toggleRunning,
      stats,
      logs,
      clearLogs,
      autoScroll,
      setAutoScroll,
    }),
    [
      config,
      updateConfig,
      setToggle,
      devices,
      selectedDevice,
      isLoadingDevices,
      fetchDevices,
      running,
      toggleRunning,
      stats,
      logs,
      clearLogs,
      autoScroll,
    ],
  );

  return <LauncherContext.Provider value={value}>{children}</LauncherContext.Provider>;
}

export function useLauncher() {
  const context = useContext(LauncherContext);
  if (!context) throw new Error("useLauncher must be used within LauncherProvider");
  return context;
}
