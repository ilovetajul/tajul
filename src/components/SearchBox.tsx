"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-white/10 px-5 py-2.5 pr-12 text-sm text-white placeholder-white/40 outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1.5 text-xs text-white"
      >
        Go
      </button>
    </form>
  );
}
