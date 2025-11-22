import React from "react";
import { useAppStore } from "../store/useAppStore";

export function Sidebar() {
  const { workspaces, activeWorkspaceId } = useAppStore();
  const list = Array.isArray(workspaces) ? workspaces : [];
  return (
    <div className="w-60 border-r border-gray-200 p-2">
      <div className="text-sm font-semibold mb-2">Workspaces</div>
      <div className="space-y-1">
        {list.map((w) => (
          <button
            key={w.id}
            onClick={() =>
              window.electronAPI?.workspace
                ?.activate?.(w.id)
                .then((res) => {
                  if (!res.ok)
                    useAppStore
                      .getState()
                      .addToast("error", res.error?.message || "Activate failed");
                })
            }
            className={`w-full text-left px-2 py-1 rounded ${
              activeWorkspaceId === w.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <span className="mr-2">{w.icon ?? "📁"}</span>
            <span>{w.name}</span>
          </button>
        ))}
      </div>
      <button
        className="mt-3 w-full bg-blue-600 text-white px-2 py-1 rounded"
        onClick={() =>
          window.electronAPI?.workspace
            ?.create?.({ name: "New Workspace" })
            .then((res) => {
              if (res.ok)
                useAppStore.getState().addToast("success", "Workspace created");
              else
                useAppStore
                  .getState()
                  .addToast("error", res.error?.message || "Create failed");
            })
        }
      >
        New Workspace
      </button>
    </div>
  );
}
