import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export function AddressBar() {
  const { activeTabId, tabs } = useAppStore();
  const active = tabs.find((t) => t.id === activeTabId);
  const [url, setUrl] = useState<string>("");

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
  };

  return (
    <form
      className="h-9 flex items-center px-2 border-b border-gray-200"
      onSubmit={onSubmit}
    >
      <input
        className="flex-1 border border-gray-300 rounded px-2 py-1"
        placeholder="Enter URL and press Enter"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        type="submit"
        className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
      >
        Go
      </button>
    </form>
  );
}
