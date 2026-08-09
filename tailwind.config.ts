import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          elevated: "hsl(var(--card-elevated))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
      },
      /**
       * Near-square scale. Every step is a small multiple of --radius (2px) so
       * the whole system stays architectural; `rounded-full` is still available
       * for genuinely circular things (avatars, icon buttons).
       */
      borderRadius: {
        sm: "1px",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "calc(var(--radius) * 2)",
        xl: "calc(var(--radius) * 3)",
        "2xl": "calc(var(--radius) * 4)",
        "3xl": "calc(var(--radius) * 6)",
      },
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
        display: ["Vazirmatn", "system-ui", "sans-serif"],
        latin: ["Cormorant Garamond", "Georgia", "serif"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        title: ["var(--text-title)", { lineHeight: "1.4", letterSpacing: "-0.03em" }],
        heading: ["var(--text-heading)", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        content: "var(--content-max)",
        prose: "var(--prose-max)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        "section-y": "var(--section-y)",
        "section-x": "var(--section-x)",
        /** Bottom inset above mobile tab bar */
        nav: "4.25rem",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      minHeight: {
        touch: "var(--touch-min)",
      },
      minWidth: {
        touch: "var(--touch-min)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        elegant: "var(--shadow-sm), var(--shadow-inner-warm)",
        card: "var(--shadow-md)",
        float: "var(--shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
