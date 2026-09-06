export type ThemeSemantic = {
  background: string;
  border: string;
  code: string;
  link: string;
  muted: string;
  subtle: string;
  text: string;
  "syntax-pink": string;
  "syntax-green": string;
  "syntax-blue": string;
};

export type ThemeDefinition = {
  name: string;
  semantic: ThemeSemantic;
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

export type PortfolioConfig = {
  avatar?: string;
  avatarWidth?: number;
  avatarHeight?: number;
  balls?: string;
  pages: Array<{ label: string; href: string }>;
};

export type PageRecord = {
  portfolio: PortfolioConfig;
  timelines?: Record<string, string>;
  intro?: string;
  sections?: PageSection[];
  assetBase?: string;
  content: string;
  galleries: GalleryMap;
  profileRoot?: string;
};
