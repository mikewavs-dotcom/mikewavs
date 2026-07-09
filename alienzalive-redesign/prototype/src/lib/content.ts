import content from "../../data/content.json";

/*
 * Single source of truth: data/content.json is a byte-identical copy of
 * /audit/content-export.json produced by the crawl. Nothing in the
 * prototype hard-codes copy that exists in the export.
 */

export type NavItem = {
  label: string;
  url: string;
  children?: NavItem[];
  note?: string;
};

export type Social = { platform: string; url: string };

export type Release = {
  title: string | null;
  image: string | null;
  streamUrl: string | null;
  note?: string;
};

export type MusicVideo = {
  title: string | null;
  artist: string | null;
  date: string | null;
  youtubeUrl: string | null;
  category?: string | null;
};

export type Artist = {
  slug: string;
  url: string;
  name: string;
  seoTitle: string | null;
  ogImage: string | null;
  bio: string[];
  images: string[];
  latestVideoEmbed: string | null;
  newRelease: Release | null;
  discography: Release[];
  tourNote: string | null;
  press: { title: string; url: string }[];
  musicVideos: MusicVideo[];
  socials: Social[];
};

export type NewsPost = {
  id: number;
  slug: string;
  url: string;
  isExternalLink: boolean;
  title: string;
  date: string;
  categories: string[];
  featuredImage: string | null;
  excerpt: string;
  bodyHtml: string;
  bodyText: string;
  images: string[];
  youtubeEmbeds: string[];
  streamLinks: string[];
};

export type Video = {
  slug: string;
  url: string;
  title: string | null;
  youtubeUrl: string | null;
  youtubeId: string | null;
  ogImage: string | null;
  categories: string[];
  artist: string | null;
  date: string | null;
  recoveredFrom?: string;
};

export type Product = {
  slug: string;
  url: string;
  name: string;
  price: string;
  currency: string;
  description: string;
  images: string[];
  options: string[];
  type: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  count: number;
  parent: number;
  url: string | null;
};

const c = content as unknown as {
  site: {
    name: string;
    url: string;
    crawlDate: string;
    platform: string;
    brandAccent: string;
    nav: NavItem[];
    footer: {
      copyright: string;
      copyrightNote: string;
      credit: { text: string; url: string; note: string };
      socials: Social[];
    };
  };
  pages: {
    home: {
      heroArtists: { name: string; image: string }[];
      heroHeadline: string[];
      eventsSection: { heading: string; empty: string };
      missionBlurb: string[];
      featuredNews: { title: string; url: string }[];
      recap2025: {
        heading: string;
        newReleases: Release[];
        featuredMusicVideos: MusicVideo[];
        featuredReleases: Release[];
      };
      newsletter: {
        heading: string;
        formHeading: string;
        fields: { name: string; type: string }[];
        submitLabel: string;
        implementation: string;
      };
      playlist: { kicker: string; heading: string; cta: string; url: string };
    };
    about: {
      kicker: string;
      heading: string;
      manifesto: string[];
      rosterTeaser: { heading: string; cta: { label: string; url: string } };
      images: string[];
      seoTitle: string | null;
      seoDescription: string | null;
    };
    meetTheFounder: {
      kicker: string;
      heading: string;
      bioHeading: string;
      bio: string[];
      pullQuotes: string[];
      placeholderFlag: string;
      scripture: { reference: string; heading: string; quote: string | null };
      cta: { label: string; url: string };
      images: string[];
      seoTitle: string | null;
      seoDescription: string | null;
    };
    artistsRoster: {
      heading: string;
      tiles: { name: string; url: string; image: string | null; genre: string | null }[];
    };
    community: {
      heading: string;
      form: {
        heading: string;
        fields: { name: string; type: string }[];
        endpoint: string;
      };
      note: string;
    };
    newsArchive: { heading: string; url: string; lists: string };
    musicNews: { heading: string; url: string; lists: string };
    shop: { heading: string; url: string; products: string[] };
  };
  artists: Artist[];
  news: NewsPost[];
  videos: Video[];
  products: Product[];
  categories: Category[];
  flags: string[];
  cruft: { url: string; reason: string }[];
};

export const site = c.site;
export const pages = c.pages;
export const artists = c.artists;
export const news = c.news;
export const videos = c.videos;
export const products = c.products;
export const categories = c.categories;

export const internalNews = news.filter((n) => !n.isExternalLink);
export const externalNews = news.filter((n) => n.isExternalLink);

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}
export function getPost(slug: string): NewsPost | undefined {
  return internalNews.find((n) => n.slug === slug);
}
export function getVideo(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug);
}
export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
export function getCategory(slug: string): Category | undefined {
  return categories.find((x) => x.slug === slug);
}
export function postsInCategory(slug: string): NewsPost[] {
  return news.filter((n) => n.categories.includes(slug));
}

/** Internal path for a news post (news posts live at the site root, as on WP). */
export function postPath(n: NewsPost): string {
  return n.isExternalLink ? n.url : `/${n.slug}/`;
}

export function internalPath(url: string): string {
  return url.replace(site.url, "") || "/";
}

export function youtubeId(urlOrEmbed: string | null): string | null {
  if (!urlOrEmbed) return null;
  const m = urlOrEmbed.match(/(?:v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export function formatDate(d: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d.toUpperCase();
  return dt
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase()
    .replace(/,/g, "");
}
