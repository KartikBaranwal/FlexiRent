"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse" />;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ y: theme === "dark" ? -20 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Sun className="w-5 h-5 text-amber-500 transition-colors" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ y: theme === "dark" ? -20 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Moon className="w-5 h-5 text-indigo-400 transition-colors" />
        </motion.div>
      </div>
    </motion.button>
  );
}
