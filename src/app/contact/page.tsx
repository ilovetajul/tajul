"use client";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="section-padding container-xl max-w-xl">
      <h1 className="mb-8 text-3xl font-bold text-white">Contact Me</h1>
      <form onSubmit={handleSubmit} className="glass space-y-4 p-6">
        {/* Honeypot field — hidden from real users, bots tend to fill it in */}
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
        <input name="name" placeholder="Name" required className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none" />
        <input name="subject" placeholder="Subject" required className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none" />
        <textarea name="message" placeholder="Message" required rows={5} className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none" />
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center disabled:opacity-50">
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
        {status === "sent" && <p className="text-secondary">Message sent — thank you!</p>}
        {status === "error" && <p className="text-red-400">Something went wrong. Please try again.</p>}
      </form>
    </section>
  );
}
