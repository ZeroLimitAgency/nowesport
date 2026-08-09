const allowedHosts = new Set(["tracker.gg", "www.tracker.gg", "fortnitetracker.com", "www.fortnitetracker.com"]);
const platforms = new Set(["epic", "pc", "xbl", "psn"]);

export type ParsedTrackerLink = {
  provider: "fortnite_tracker";
  platform?: string;
  accountIdentifier: string;
  username: string;
  normalizedUrl: string;
};

export function normalizeNickname(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en");
}

export function parseTrackerProfileUrl(input: string): ParsedTrackerLink | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname.toLowerCase()) || url.username || url.password) return null;
  const segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const profileIndex = segments.findIndex((segment) => segment.toLowerCase() === "profile");
  if (profileIndex < 0) return null;
  const tail = segments.slice(profileIndex + 1);
  if (!tail.length) return null;
  const platform = platforms.has(tail[0]?.toLowerCase()) ? tail.shift()!.toLowerCase() : undefined;
  const username = tail.join("/").trim();
  if (!username || username.length > 100 || /[?#]/.test(username)) return null;
  const normalizedPath = ["profile", platform, ...tail].filter((segment): segment is string => Boolean(segment)).map(encodeURIComponent).join("/");
  return {
    provider: "fortnite_tracker",
    platform,
    accountIdentifier: username,
    username,
    normalizedUrl: `https://${url.hostname.toLowerCase()}/${normalizedPath}`,
  };
}
