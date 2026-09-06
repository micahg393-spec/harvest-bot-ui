import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Settings,
  UserRound,
  MessageSquareText,
  Minus,
  X,
  RefreshCw,
  RotateCcw,
  Crosshair,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLASH FARM — Game Automation Launcher" },
      {
        name: "description",
        content: "A compact control launcher for managing Clash farming sessions, devices, and logs.",
      },
      { property: "og:title", content: "CLASH FARM — Game Automation Launcher" },
      {
        property: "og:description",
        content: "Control farming sessions, device settings, and live automation logs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type TabId = "home" | "settings" | "profile" | "log";

const tabs = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "settings" as const, label: "Settings", icon: Settings },
  { id: "profile" as const, label: "Profile", icon: UserRound },
  { id: "log" as const, label: "Log", icon: MessageSquareText },
];

const settings = [
  "Deploy Heroes Automatically",
  "Use Rage Spells",
  "Use Siege Machines",
  "Auto Upgrade Walls",
  "Stop When Storage Get Full",
  "Donate Troops Before Attack",
  "Ask For Donation Before Attack",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </span>
  );
}

function HomePanel() {
  const [running, setRunning] = useState(false);
  const [loot, setLoot] = useState([500]);
  const [storage, setStorage] = useState([27]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2">
          <FieldLabel>Select Mode</FieldLabel>
          <Select defaultValue="home-village">
            <SelectTrigger className="h-11 border-launcher-line bg-launcher-control px-3.5 shadow-none hover:bg-launcher-control-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home-village">Home Village</SelectItem>
              <SelectItem value="builder-base">Builder Base</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2">
          <FieldLabel>Select Army</FieldLabel>
          <Select defaultValue="electric-dragon">
            <SelectTrigger className="h-11 border-launcher-line bg-launcher-control px-3.5 shadow-none hover:bg-launcher-control-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electric-dragon">Electric Dragon</SelectItem>
              <SelectItem value="dragon-rider">Dragon Rider</SelectItem>
              <SelectItem value="super-barbarian">Super Barbarian</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="space-y-5 rounded-lg border border-launcher-line bg-launcher-card p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Minimum Loot Threshold</FieldLabel>
            <span className="font-mono text-xs font-semibold text-primary">{loot[0]}k</span>
          </div>
          <Slider value={loot} onValueChange={setLoot} min={100} max={1000} step={50} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Max Storage Capacity</FieldLabel>
            <span className="font-mono text-xs font-semibold text-primary">
              {storage[0]?.toFixed(1)}M
            </span>
          </div>
          <Slider value={storage} onValueChange={setStorage} min={5} max={40} step={0.5} />
        </div>
      </div>

      <Button
        className={cn(
          "h-14 w-full text-sm font-black tracking-[0.18em] shadow-none transition-all active:scale-[0.99]",
          running
            ? "bg-run-stop text-run-stop-foreground hover:bg-run-stop/90"
            : "bg-run-start text-run-start-foreground hover:bg-run-start/90",
        )}
        onClick={() => setRunning((value) => !value)}
      >
        {running ? "STOP" : "START"}
      </Button>

      <section className="overflow-hidden rounded-lg border border-launcher-line bg-launcher-card">
        <div className="flex items-center justify-between border-b border-launcher-line px-4 py-3">
          <FieldLabel>Current Session</FieldLabel>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                running ? "bg-run-start" : "bg-muted-foreground",
              )}
            />
            {running ? "Active" : "Idle"}
          </span>
        </div>
        <div className="grid grid-cols-5 divide-x divide-launcher-line">
          {[
            ["Gold", "0", "text-session-gold"],
            ["Elixir", "0", "text-session-elixir"],
            ["Attack", "0", "text-session-cyan"],
            ["Wall", "0", "text-session-cyan"],
            ["Time Elapsed", "0m", "text-foreground"],
          ].map(([label, value, color]) => (
            <div className="px-3 py-4 text-center" key={label}>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
              </p>
              <p className={cn("font-mono text-lg font-bold", color)}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPanel() {
  const [enabled, setEnabled] = useState(() => settings.map(() => true));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <FieldLabel>Select Device</FieldLabel>
        <div className="flex gap-2">
          <Select defaultValue="emulator-5554">
            <SelectTrigger className="h-11 flex-1 border-launcher-line bg-launcher-control px-3.5 font-mono text-xs shadow-none hover:bg-launcher-control-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emulator-5554">emulator-5554</SelectItem>
              <SelectItem value="emulator-5556">emulator-5556</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="h-11 bg-launcher-control hover:bg-launcher-control-hover">
            <RefreshCw />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-11 border-launcher-line bg-launcher-card hover:bg-launcher-control-hover">
          <RotateCcw />
          Restart ADB Server
        </Button>
        <Button variant="outline" className="h-11 border-launcher-line bg-launcher-card hover:bg-launcher-control-hover">
          <Crosshair />
          Capture Event Troop
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-launcher-line bg-launcher-card">
        {settings.map((label, index) => (
          <label
            className="flex cursor-pointer items-center justify-between border-b border-launcher-line px-4 py-3.5 last:border-b-0 hover:bg-launcher-card-raised"
            key={label}
          >
            <span className="text-sm font-medium text-secondary-foreground">{label}</span>
            <Switch
              checked={enabled[index]}
              onCheckedChange={(checked) =>
                setEnabled((values) => values.map((value, i) => (i === index ? checked : value)))
              }
            />
          </label>
        ))}
      </section>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="flex min-h-[390px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-launcher-line-strong bg-launcher-card text-primary">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-base font-bold">Local Operator</h2>
        <p className="mt-1 text-sm text-muted-foreground">Automation profile ready</p>
      </div>
    </div>
  );
}

function LogPanel() {
  const [autoScroll, setAutoScroll] = useState(true);
  const [lines, setLines] = useState([
    { time: "15:42:08", text: "Input backend: sendevent (fast)", color: "text-terminal-green" },
    { time: "15:42:09", text: "Searching for a base to attack...", color: "text-terminal-purple" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-launcher-line bg-launcher-card px-3 py-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-secondary-foreground">
          <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
          Auto-scroll
        </label>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted-foreground">{lines.length} lines</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-launcher-control-hover hover:text-foreground"
            onClick={() => setLines([])}
          >
            <Trash2 />
            Clear
          </Button>
        </div>
      </div>
      <div className="min-h-[390px] rounded-lg border border-launcher-line bg-background p-4 font-mono text-xs leading-7 shadow-inner">
        {lines.length ? (
          lines.map((line) => (
            <p key={`${line.time}-${line.text}`} className={line.color}>
              <span className="mr-3 text-muted-foreground">[{line.time}]</span>
              {line.text}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground">No log entries.</p>
        )}
      </div>
    </div>
  );
}

function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Button variant="outline" onClick={() => setClosed(false)}>
          Open Harvest Bot
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="launcher-glow w-full max-w-[680px] overflow-hidden rounded-xl border border-launcher-line-strong bg-launcher-shell">
        <header className="flex h-14 items-center justify-between border-b border-launcher-line px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-black text-primary-foreground">
              H
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.14em]">HARVEST BOT</h1>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Clash Farm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label={minimized ? "Restore window" : "Minimize window"}
              title={minimized ? "Restore" : "Minimize"}
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-launcher-control-hover hover:text-foreground"
              onClick={() => setMinimized((value) => !value)}
            >
              <Minus />
            </Button>
            <Button
              aria-label="Close window"
              title="Close"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setClosed(true)}
            >
              <X />
            </Button>
          </div>
        </header>

        {!minimized && (
          <>
            <nav className="border-b border-launcher-line px-4 py-2" aria-label="Launcher navigation">
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-launcher-card p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      className={cn(
                        "h-9 gap-2 text-xs text-muted-foreground hover:bg-launcher-control-hover hover:text-foreground",
                        activeTab === tab.id && "bg-launcher-tab text-primary hover:bg-launcher-tab",
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </nav>

            <div className="p-5">
              {activeTab === "home" && <HomePanel />}
              {activeTab === "settings" && <SettingsPanel />}
              {activeTab === "profile" && <ProfilePanel />}
              {activeTab === "log" && <LogPanel />}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
