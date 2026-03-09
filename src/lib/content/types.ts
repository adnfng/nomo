export type ThemeName = "adn" | "dark" | "light";
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
  align: "top",
  theme: "light",
  font: "system",
  fontsize: "14.4px",
};
