import { useEffect } from "react";

import type { PageRecord, ThemeDefinition, ThemeName } from "../content/types";

const SYSTEM_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
type ResolvedThemeName = Exclude<ThemeName, "system">;

const THEME_URLS: Record<ResolvedThemeName, string> = {
  adn: "/themes/adn.json",
  light: "/themes/light.json",
  dark: "/themes/dark.json",
};

const themeCache = new Map<ResolvedThemeName, Promise<ThemeDefinition>>();

function hexToOverlay(color: string): string {
  const normalized = color.replace("#", "");
  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((part) => `${part}${part}`)
        .join("")
    : normalized;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    return "rgb(0 0 0 / 0.2)";
  }

  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);

  return `rgb(${red} ${green} ${blue} / 0.2)`;
}

function buildGoogleFontUrl(fontName: string): string {
  const family = fontName.trim().split(/\s+/).join("+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
}

function loadTheme(theme: ResolvedThemeName): Promise<ThemeDefinition> {
  const cached = themeCache.get(theme);
  if (cached) {
    return cached;
  }

  const promise = fetch(THEME_URLS[theme]).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${theme} theme.`);
    }

    return (await response.json()) as ThemeDefinition;
  });

  themeCache.set(theme, promise);
  return promise;
}

function applyFont(font: string) {
  const root = document.documentElement;
  const fontLinkId = "page-font-link";
  const existing = document.getElementById(fontLinkId);

  if (font.toLowerCase() === "system") {
    root.style.setProperty("--page-font-family", SYSTEM_FONT_STACK);
    existing?.remove();
    return;
  }

  root.style.setProperty("--page-font-family", `"${font}", ${SYSTEM_FONT_STACK}`);

  const link = existing instanceof HTMLLinkElement ? existing : document.createElement("link");
  link.id = fontLinkId;
  link.rel = "stylesheet";
  link.href = buildGoogleFontUrl(font);

  if (!existing) {
    document.head.append(link);
  }
}

function resolveThemeName(theme: ThemeName): ResolvedThemeName {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeDefinition, themeName: ResolvedThemeName) {
  const root = document.documentElement;

  root.style.colorScheme = themeName;
  root.style.removeProperty("--surface");
  root.style.removeProperty("--accent");

  for (const [key, value] of Object.entries(theme.semantic)) {
    root.style.setProperty(`--${key}`, value);
  }

  root.style.setProperty(
    "--background-overlay",
    hexToOverlay(theme.semantic.background ?? "#000000"),
  );
}

export function usePagePresentation(page: PageRecord | null) {
  useEffect(() => {
    if (!page) {
      return;
    }

    let cancelled = false;
    let mediaQuery: MediaQueryList | null = null;

    document.documentElement.style.setProperty("--page-font-size", page.frontmatter.fontsize);
    applyFont(page.frontmatter.font);

    const updateTheme = () => {
      const resolvedTheme = resolveThemeName(page.frontmatter.theme);

      loadTheme(resolvedTheme)
        .then((theme) => {
          if (cancelled) {
            return;
          }

          applyTheme(theme, resolvedTheme);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    };

    updateTheme();

    if (page.frontmatter.theme === "system") {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateTheme);
    }

    return () => {
      cancelled = true;

      if (mediaQuery) {
        mediaQuery.removeEventListener("change", updateTheme);
      }
    };
  }, [page]);
}
