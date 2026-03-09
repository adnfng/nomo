export type ThemeName = "light" | "dark";

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
  theme: ThemeName;
  font: string;
  fontsize: string;
};

export type GalleryDefinition = {
  items: string[];
  width?: number;
  height?: number;
};

export type GalleryMap = Record<string, GalleryDefinition>;

export type PageRecord = {
  content: string;
  frontmatter: PageFrontmatter;
  galleries: GalleryMap;
};

export const DEFAULT_FRONTMATTER: PageFrontmatter = {
  theme: "light",
  font: "system",
  fontsize: "14.4px",
};
