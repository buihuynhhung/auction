"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("auction-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  return (
    <button
      type="button"
      aria-label="Đổi giao diện sáng tối"
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
      onClick={() => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          Sáng
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Tối
        </>
      )}
    </button>
  );
}
