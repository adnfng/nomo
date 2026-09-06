export type NativeSlug = "404" | "changelog" | "docs" | "home";
export type RouteMatch =
  | { slug: NativeSlug; type: "native" }
  | { slug: string; type: "profile-content"; username: string; contentPath: string }
  | { slug: string; type: "profile-root"; username: string }
  | { slug: "404"; type: "not-found" };
const NATIVE_SLUGS = new Set<NativeSlug>(["home", "docs", "changelog", "404"]);
const GITHUB_USERNAME_PATTERN = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;

export function matchRoute(pathname: string): RouteMatch {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { slug: "home", type: "native" };
  }

  const [segment, ...contentSegments] = segments;
  const slug = segment.toLowerCase();

  if (NATIVE_SLUGS.has(slug as NativeSlug)) {
    if (contentSegments.length > 0) {
      return { slug: "404", type: "not-found" };
    }

    return { slug: slug as NativeSlug, type: "native" };
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

