const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

export function isVideoSource(src: string | null | undefined): boolean {
  if (!src) {
    return false;
  }

  const clean = src.split("?")[0]?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.some((extension) => clean.endsWith(extension));
}
