"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  House,
  LibraryBig,
  Star,
} from "lucide-react";
import PortalLogo from "@/components/PortalLogo";
import styles from "./StudentHeader.module.css";
import MaintenanceDialog from "@/components/MaintenanceDialog";

const gameRoutes = [
  "/game-hub",
  "/leaderboard",
  "/time-attack",
  "/sudden-death",
  "/scholars-wager",
];
const classRoutes = ["/schedule", "/attendance", "/todays-class"];
const matches = (path: string, route: string) =>
  path === route || path.startsWith(`${route}/`);
const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: House,
    routes: ["/dashboard", ...classRoutes],
  },
  {
    href: "/cbt-simulator",
    label: "CBT Simulator",
    Icon: ClipboardCheck,
    routes: ["/cbt-simulator"],
  },
  { href: "/jamb-past-questions", label: "Past Questions", Icon: BookOpen, routes: ["/jamb-past-questions"] },
  { href: "/study-hub", label: "Study Hub", Icon: LibraryBig, routes: ["/study-hub"] },
  { href: "/game-hub", label: "Game Hub", Icon: Gamepad2, routes: gameRoutes },
  { href: "/subject-test", label: "Subject Tests", Icon: ClipboardCheck, routes: ["/subject-test"] },
];
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const storedName = () => {
  try {
    return localStorage.getItem("quizTakerEmail")?.split("@")[0] || "";
  } catch {
    return "";
  }
};
const serverName = () => "";

export function StudentHeader({
  displayName,
  weeklyScore,
}: {
  displayName?: string;
  weeklyScore?: number;
}) {
  const pathname = usePathname();
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const savedName = useSyncExternalStore(subscribe, storedName, serverName);
  const name = displayName || savedName || "BJOT Scholar";
  const initials = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          href="/dashboard"
          className={styles.brand}
          aria-label="BJOT student dashboard"
        >
          <PortalLogo size={100} priority />
          <span>
            <strong>
              <small>BJOT</small>
            </strong>
            <em>STUDENT DASHBOARD</em>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.routes.some((route) =>
              matches(pathname, route),
            );
            const Icon = item.Icon;
            if (item.href === "/jamb-past-questions") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setMaintenanceOpen(true)}
                  className={`${styles.navButton} ${active ? styles.navActive : ""}`}
                  aria-label={`${item.label}, currently under maintenance`}
                  title={`${item.label} — Under maintenance`}
                >
                  {active && <i aria-hidden="true" />}
                  <Icon className={styles.navIcon} size={20} aria-hidden="true" />
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.navActive : undefined}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                {active && <i aria-hidden="true" />}
                <Icon className={styles.navIcon} size={20} aria-hidden="true" />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.headerRight}>
          <Link
            href="/leaderboard"
            className={styles.weeklyBadge}
            aria-label={
              weeklyScore !== undefined
                ? `Weekly leaderboard: ${weeklyScore.toLocaleString()} points`
                : "Weekly leaderboard"
            }
          >
            <Star size={13} fill="currentColor" />
            {weeklyScore !== undefined
              ? `${weeklyScore.toLocaleString()} pts`
              : "Weekly rankings"}
          </Link>
          <Link
            href="/dashboard"
            className={styles.profile}
            aria-label={`${name}, student dashboard`}
          >
            <span>{initials}</span>
            <div>
              <strong>{name}</strong>
              <small>Student portal</small>
            </div>
          </Link>
        </div>
      </div>
      <MaintenanceDialog open={maintenanceOpen} onClose={() => setMaintenanceOpen(false)} />
    </header>
  );
}

// Public pages keep their own navigation. Dashboard and leaderboard pages
// supply their loaded student details to the same header component.
export default function StudentPortalHeader() {
  const pathname = usePathname();
  if (
    pathname === "/dashboard" ||
    pathname === "/leaderboard" ||
    !navigation.some((item) =>
      item.routes.some((route) => matches(pathname, route)),
    )
  )
    return null;
  return <StudentHeader />;
}
