import { THEME_STORAGE_KEY } from "./constants";

export type ResolvedTheme = "light" | "dark";

const listeners = new Set<() => void>();
const DARK_QUERY = "(prefers-color-scheme: dark)";

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeTheme(callback: () => void): () => void {
  listeners.add(callback);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", callback);
  return () => {
    listeners.delete(callback);
    media.removeEventListener("change", callback);
  };
}

/** Reads the active theme from <html data-theme>, falling back to the OS preference. */
export function getThemeSnapshot(): ResolvedTheme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function getServerThemeSnapshot(): ResolvedTheme {
  return "light";
}

function updateMetaThemeColor(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const color = theme === "dark" ? "#000000" : "#ffffff";
  let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

export function setTheme(theme: ResolvedTheme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable: theme still applies for this session */
  }
  updateMetaThemeColor(theme);
  notify();
}

/** Inline script run before first paint to avoid a flash of the wrong theme and sync mobile browser bar color. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var isDark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);var c=isDark?'#000000':'#ffffff';if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}var m=document.querySelector('meta[name="theme-color"]:not([media])');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}m.setAttribute('content',c);}catch(e){}})();`;
