/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public URLs, e.g. https://xxxxx.supabase.co/storage/v1/object/public/...
      { protocol: "https", hostname: "*.supabase.co" },
      // Fallback for any external-URL / Google Drive images an admin pastes in —
      // narrower than a blanket wildcard, still broad enough to not fight the admin.
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
