import type { Social } from "@/lib/content";

const NAMES: Record<string, string> = {
  instagram: "Instagram",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
  facebook: "Facebook",
  apple: "Apple Music",
  soundcloud: "SoundCloud",
};

/* Text badges instead of icon fonts: survives any platform, reads editorial. */
export default function SocialIcons({
  socials,
  label,
}: {
  socials: Social[];
  label: string;
}) {
  if (!socials.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label={label}>
      {socials.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="meta text-ink-dim underline-offset-4 hover:text-accent hover:underline"
          >
            {NAMES[s.platform?.toLowerCase() ?? ""] ?? s.platform ?? "Link"}
            <span aria-hidden="true"> ↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
