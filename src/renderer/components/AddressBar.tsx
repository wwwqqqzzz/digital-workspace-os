import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../store/useAppStore";

export function AddressBar() {
  const { activeTabId, tabs, history, addHistory } = useAppStore();
  const active = tabs.find((t) => t.id === activeTabId);
  const [url, setUrl] = useState<string>("");
  const [suggests, setSuggests] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestsRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<number>(-1);

  useEffect(() => {
    if (active) {
      setUrl(active.url ?? "");
    }
  }, [activeTabId]);

  useEffect(() => {
    window.electronAPI.onUiEvent?.((e) => {
      if (e.type === "focus-addressbar") {
        inputRef.current?.focus();
        const el = inputRef.current;
        if (el) el.select();
      }
    });
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !url) return;
    const target = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    window.electronAPI?.tab?.navigate?.(activeTabId, target).then((res) => {
      if (res.ok) useAppStore.getState().addToast("success", "Navigated");
      else
        useAppStore
          .getState()
          .addToast("error", res.error?.message || "Navigate failed");
    });
    addHistory(target);
    setSuggests([]);
    setSelected(-1);
    window.electronAPI.ui?.setTopBarHeight?.(140);
  };

  const onChange = (v: string) => {
    setUrl(v);
    const pool = Array.from(
      new Set([
        ...(history || []),
        ...tabs.map((t) => t.url || "").filter(Boolean),
      ])
    );
    const scored = pool.map((u) => {
      const lower = u.toLowerCase();
      const q = v.toLowerCase();
      let score = 0;
      if (lower.startsWith(q)) score += 100;
      else if (lower.includes(q)) score += 50;
      const recency = (history || []).indexOf(u);
      if (recency >= 0) score += Math.max(0, 50 - recency);
      return { u, score };
    });
    const s = v
      ? scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
          .map((x) => x.u)
      : [];
    setSuggests(s);
    setSelected(s.length ? 0 : -1);
  };

  useEffect(() => {
    const h = (suggestsRef.current?.offsetHeight || 0) + 100;
    window.electronAPI.ui?.setTopBarHeight?.(h);
    if (suggests.length === 0) window.electronAPI.ui?.setTopBarHeight?.(100);
  }, [suggests.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key.toLowerCase() === "l") {
        inputRef.current?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="border-b border-gray-200">
      <form className="h-9 flex items-center px-2" onSubmit={onSubmit}>
        <input
          className="flex-1 border border-gray-300 rounded px-2 py-1"
          placeholder="Enter URL and press Enter"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          ref={inputRef}
          onKeyDown={(e) => {
            if (suggests.length) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((i) => Math.min(i + 1, suggests.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && selected >= 0) {
                e.preventDefault();
                const s = suggests[selected];
                setUrl(s);
                if (activeTabId) {
                  const target = s.match(/^https?:\/\//i) ? s : `https://${s}`;
                  window.electronAPI.tab.navigate(activeTabId, target);
                  addHistory(target);
                }
                setSuggests([]);
                setSelected(-1);
                window.electronAPI.ui?.setTopBarHeight?.(140);
              }
              if (e.key === "Escape") {
                setSuggests([]);
              }
            }
          }}
        />
        <button
          type="submit"
          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
        >
          Go
        </button>
      </form>
      {suggests.length > 0 && (
        <div className="px-2 pb-2">
          <div
            ref={suggestsRef}
            className="bg-white border border-gray-200 rounded shadow max-h-40 overflow-auto"
          >
            {suggests.map((s, idx) => (
              <button
                key={s}
                className={`block w-full text-left px-2 py-1 ${
                  selected === idx ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  const target = s.match(/^https?:\/\//i) ? s : `https://${s}`;
                  setUrl(target);
                  if (activeTabId) {
                    window.electronAPI.tab.navigate(activeTabId, target);
                    addHistory(target);
                  }
                  setSuggests([]);
                  setSelected(-1);
                  window.electronAPI.ui?.setTopBarHeight?.(140);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
