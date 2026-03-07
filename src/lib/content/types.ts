export type ThemeName = "light" | "dark";

export type ThemeDefinition = {
  name: string;
  semantic: Record<string, string>;
};

export type PageFrontmatter = {
  theme: ThemeName;
  font: string;
  fontsize: string;
};

export type GalleryMap = Record<string, string[]>;

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
