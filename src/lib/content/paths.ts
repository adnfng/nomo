export function buildGitHubRawBase(username: string, branch: string): string {
  return `https://raw.githubusercontent.com/${username}/.nomo/${branch}`;
}

export function buildGitHubRawUrl(username: string, branch: string, path: string): string {
  return `${buildGitHubRawBase(username, branch)}/${path.replace(/^\/+/, "")}`;
}

export function resolveAssetUrl(value: string | undefined, assetBase?: string): string | undefined {
  if (!value || !assetBase || !value.startsWith("/assets/")) {
    return value;
  }

  return `${assetBase}${value}`;
}

export function resolveContentHref(href: string | undefined, profileRoot?: string): string | undefined {
  if (!href || !profileRoot || !href.startsWith("/content/")) {
    return href;
  }

  const contentPath = href.replace(/^\/content\//, "").replace(/^\/*/, "").replace(/\.md$/i, "");
  return `${profileRoot}/${contentPath}`;
}

export function isExternalHref(href: string | undefined): boolean {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}
