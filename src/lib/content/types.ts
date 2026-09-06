export type ThemeName = "adn" | "dark" | "light" | "system";
export type PageAlign = "top" | "middle" | "bottom";

export type ThemeSemantic = {
  background: string;
  border: string;
  code: string;
  link: string;
  muted: string;
  subtle: string;
  text: string;
};

export type ThemeDefinition = {
  name: string;
  semantic: ThemeSemantic;
};

export type PageFrontmatter = {
  align: PageAlign;
  theme: ThemeName;
  font: string;
  fontsize: string;
};

export type GalleryDefinition = {
  items: string[];
};

export type GalleryMap = Record<string, GalleryDefinition>;

export type PageSection = {
  label: string;
  slug: string;
  content: string;
};

export type PageRecord = {
  explicit: Partial<PageFrontmatter>;
  portfolio?: PortfolioConfig;
  timelines?: Record<string, string>;
  intro?: string;
  sections?: PageSection[];
  assetBase?: string;
  content: string;
  frontmatter: PageFrontmatter;
  galleries: GalleryMap;
  profileRoot?: string;
};

export const DEFAULT_FRONTMATTER: PageFrontmatter = {
  align: "top",
  theme: "light",
  font: "system",
  fontsize: "14.4px",
};

export type PortfolioConfig = {
  version: 2;
  layout: "portfolio";
  name: string;
  avatar?: string;
  pages: Array<{ label: string; href: string }>;
};

export const PORTFOLIO_FRONTMATTER: PageFrontmatter = {
  align: "top", theme: "light", font: "Helvetica Neue", fontsize: "15px",
};
