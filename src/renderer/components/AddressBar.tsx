import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export function AddressBar() {
  const { activeTabId, tabs, history, addHistory } = useAppStore();
  const active = tabs.find((t) => t.id === activeTabId);
  const [url, setUrl] = useState<string>("");
  const [suggests, setSuggests] = useState<string[]>([]);

  useEffect(() => {
    if (active) {
      setUrl(active.url ?? "");
    }
  }, [activeTabId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !url) return;
    window.electronAPI?.tab?.navigate?.(activeTabId, url).then(res => {
      if(res.ok) useAppStore.getState().addToast('success','Navigated');
      else useAppStore.getState().addToast('error', res.error?.message || 'Navigate failed')
    });
    addHistory(url)
  };

  const onChange = (v: string) => {
    setUrl(v)
    const pool = Array.from(new Set([...(history || []), ...tabs.map(t => t.url || '').filter(Boolean)]))
    const s = v ? pool.filter(u => u.toLowerCase().includes(v.toLowerCase())).slice(0, 8) : []
    setSuggests(s)
  }

  return (
    <div className="border-b border-gray-200">
      <form className="h-9 flex items-center px-2" onSubmit={onSubmit}>
        <input
          className="flex-1 border border-gray-300 rounded px-2 py-1"
          placeholder="Enter URL and press Enter"
          value={url}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="submit" className="ml-2 px-2 py-1 bg-blue-600 text-white rounded">Go</button>
      </form>
      {suggests.length > 0 && (
        <div className="px-2 pb-2">
          <div className="bg-white border border-gray-200 rounded shadow max-h-40 overflow-auto">
            {suggests.map(s => (
              <button key={s} className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => onChange(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
