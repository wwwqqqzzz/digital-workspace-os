import React from "react";
import { useAppStore } from "../store/useAppStore";

export function TabBar() {
  const { tabs, activeTabId, activeWorkspaceId } = useAppStore();
  return (
    <div className="flex items-center h-10 border-b border-gray-200 px-2 space-x-2">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`flex items-center px-2 py-1 rounded ${
            activeTabId === t.id ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          <button
            onClick={() =>
              window.electronAPI?.tab
                ?.activate?.(t.id)
                .then((res) => {
                  if (!res.ok)
                    useAppStore
                      .getState()
                      .addToast(
                        "error",
                        res.error?.message || "Activate tab failed"
                      );
                })
            }
            className="flex items-center"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", t.id);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const fromId = e.dataTransfer.getData("text/plain");
              if (!fromId || !activeWorkspaceId) return;
              const ids = tabs.map((x) => x.id);
              const fromIdx = ids.indexOf(fromId);
              const toIdx = ids.indexOf(t.id);
              if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
              ids.splice(fromIdx, 1);
              ids.splice(toIdx, 0, fromId);
              window.electronAPI?.tab
                ?.reorder?.(activeWorkspaceId, ids)
                .then((res) => {
                  if (res.ok)
                    useAppStore.getState().addToast("success", "Tabs reordered");
                  else
                    useAppStore
                      .getState()
                      .addToast("error", res.error?.message || "Reorder failed");
                });
            }}
          >
            <span className="mr-2">
              {t.favicon ? <img src={t.favicon} className="w-4 h-4" /> : "🌐"}
            </span>
            <span>{t.title ?? "Tab"}</span>
          </button>
          <button
            className="ml-2 text-gray-600 hover:text-red-600"
            onClick={() => window.electronAPI?.tab?.close?.(t.id)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="ml-auto bg-blue-600 text-white px-2 py-1 rounded"
        onClick={() => window.electronAPI?.tab?.create?.("https://example.com").then(res => { if(res.ok) useAppStore.getState().addToast('success','Tab created'); else useAppStore.getState().addToast('error', res.error?.message || 'Create tab failed') })}
      >
        + New Tab
      </button>
    </div>
  );
}
