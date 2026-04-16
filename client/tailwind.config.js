/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3543bb",
          secondary: "#0f172a",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          background: "#f8fafc",
          surface: "#ffffff",
          muted: "#64748b",
          border: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Manrope", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 24px 60px rgba(15, 23, 42, 0.12)",
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)",
        insetSoft: "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(53, 67, 187, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.14), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,245,249,0.96))",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

