/**
 * Solarcast Design Tokens
 *
 * Central design tokens used throughout the application.
 * These match the CSS custom properties defined in globals.css.
 */

export const colors = {
  primary: {
    50: "#FFF7F0",
    100: "#FFE8D5",
    200: "#FFD1AA",
    300: "#FFB980",
    400: "#FFA255",
    500: "#FF5A00",
    600: "#E05000",
    700: "#BF4400",
    800: "#9E3700",
    900: "#7D2B00",
    950: "#5C1F00",
  },
  sky: {
    50: "#F0FAFF",
    100: "#D5F2FF",
    200: "#AAE5FF",
    300: "#80D8FF",
    400: "#6FC8F3",
    500: "#4DB8E8",
    600: "#3A9ECF",
    700: "#2E83AD",
    800: "#23698C",
    900: "#1A4F6A",
    950: "#113548",
  },
  surface: {
    DEFAULT: "#FFFFFF",
    secondary: "#F8F9FA",
    tertiary: "#F1F3F5",
  },
  text: {
    primary: "#111827",
    secondary: "#4B5563",
    muted: "#9CA3AF",
  },
} as const;

export const typography = {
  hero: "clamp(3rem, 8vw, 6rem)",
  display: "clamp(2rem, 5vw, 4rem)",
  h1: "clamp(1.75rem, 4vw, 3rem)",
  h2: "clamp(1.5rem, 3vw, 2.25rem)",
  h3: "clamp(1.25rem, 2vw, 1.75rem)",
  body: "1rem",
  small: "0.875rem",
  caption: "0.75rem",
} as const;

export const spacing = {
  section: "clamp(4rem, 10vw, 8rem)",
  container: "clamp(1rem, 5vw, 5rem)",
} as const;

export const shadows = {
  soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
  glass: "0 8px 32px rgba(0, 0, 0, 0.06)",
  card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
} as const;

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
} as const;
