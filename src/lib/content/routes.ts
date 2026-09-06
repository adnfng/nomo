export type NativeSlug = "404" | "changelog" | "docs" | "home";
export type RouteMatch =
  | { slug: NativeSlug; type: "native"; section?: string }
  | { slug: string; type: "profile-content"; username: string; contentPath: string }
  | { slug: string; type: "profile-root"; username: string }
  | { slug: "404"; type: "not-found" };
const NATIVE_SLUGS = new Set<NativeSlug>(["home", "docs", "changelog", "404"]);
const GITHUB_USERNAME_PATTERN = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;

function matchNative(slug: NativeSlug, contentSegments: string[]): RouteMatch {
  if (contentSegments.length > 1 || (slug === "404" && contentSegments.length)) {
    return { slug: "404", type: "not-found" };
  }
  return { slug, type: "native", section: contentSegments[0]?.toLowerCase() };
}

export function matchRoute(pathname: string): RouteMatch {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { slug: "home", type: "native" };
  }

  const [segment, ...contentSegments] = segments;
  const slug = segment.toLowerCase();

  if (NATIVE_SLUGS.has(slug as NativeSlug)) {
    return matchNative(slug as NativeSlug, contentSegments);
  }

  if (GITHUB_USERNAME_PATTERN.test(segment)) {
    if (contentSegments.length === 0) {
      return { slug, type: "profile-root", username: segment };
    }

    return {
      contentPath: contentSegments.join("/"),
      slug: contentSegments[contentSegments.length - 1].toLowerCase(),
      type: "profile-content",
      username: segment,
    };
  }

  return { slug: "404", type: "not-found" };
}

