"use client";
import { useEffect, useState } from "react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function load() {
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(m: any) {
    await fetch(`/api/admin/messages/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !m.read }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    load();
  }

  const visible = filter === "unread" ? messages.filter((m) => !m.read) : messages;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setFilter("all")} className={`rounded-full px-4 py-1.5 ${filter === "all" ? "bg-primary text-white" : "glass text-white/70"}`}>All</button>
          <button onClick={() => setFilter("unread")} className={`rounded-full px-4 py-1.5 ${filter === "unread" ? "bg-primary text-white" : "glass text-white/70"}`}>Unread</button>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-white/60">No messages here.</p>
      ) : (
        <div className="glass divide-y divide-white/10">
          {visible.map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`font-medium ${m.read ? "text-white/70" : "text-white"}`}>{m.subject}</span>
                  {!m.read && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">new</span>}
                </div>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => toggleRead(m)} className="btn-outline !px-3 !py-1.5">{m.read ? "Mark unread" : "Mark read"}</button>
                  <button onClick={() => remove(m.id)} className="rounded-full border border-red-400/30 px-3 py-1.5 text-red-400 hover:bg-red-400/10">Delete</button>
                </div>
              </div>
              <p className="mt-1 text-sm text-white/50">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a> · {new Date(m.createdAt).toLocaleString()}</p>
              <p className="mt-2 whitespace-pre-line text-white/80">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
