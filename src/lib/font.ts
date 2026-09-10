import { Poppins } from "next/font/google";

// This is the actual fix for the audit finding: tailwind.config.ts references
// `var(--font-poppins)` but nothing ever defined that variable. This does.
// Imported once here so both root layouts (site + admin) share the same font
// instance instead of each triggering its own font optimization pass.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
