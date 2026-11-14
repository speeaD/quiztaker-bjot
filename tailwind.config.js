/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind 3 emits CSS without the native layers and modern color functions
  // required by v4, so students on older mobile browsers can still use the portal.
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "blue-bg": "var(--blue-bg)",
        paper: "#fbfaf6",
        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
        popover: "hsl(0 0% 100% / <alpha-value>)",
        "popover-foreground": "hsl(222 47% 11% / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
        muted: "hsl(220 14% 96% / <alpha-value>)",
        "muted-foreground": "hsl(220 9% 46% / <alpha-value>)",
        accent: "hsl(210 40% 96% / <alpha-value>)",
        "accent-foreground": "hsl(222 47% 11% / <alpha-value>)",
        destructive: "hsl(0 84% 60% / <alpha-value>)",
        "destructive-foreground": "hsl(0 0% 100% / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        ...Object.fromEntries([
          "surface", "surface-dim", "surface-bright",
          "surface-container-lowest", "surface-container-low", "surface-container",
          "surface-container-high", "surface-container-highest", "on-surface",
          "on-surface-variant", "inverse-surface", "inverse-on-surface",
          "outline", "outline-variant", "surface-tint",
          "stat-blue", "stat-blue-bg", "stat-yellow", "stat-yellow-bg",
          "stat-cyan", "stat-cyan-bg", "stat-green", "stat-green-bg",
          "stat-purple", "stat-purple-bg", "status-pending", "status-pending-bg",
          "status-completed", "status-completed-bg", "status-progress", "status-progress-bg",
        ].map((name) => [name, `hsl(var(--${name}) / <alpha-value>)`])),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderColor: { DEFAULT: "currentColor" },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        elevation: "var(--shadow-elevation)",
        "primary-action": "var(--shadow-primary-action)",
      },
      blur: { sm: "8px", "2xl": "40px" },
    },
  },
  plugins: [],
};
