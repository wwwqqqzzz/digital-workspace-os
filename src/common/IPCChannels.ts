export const IPC_CHANNELS = {
  WORKSPACE_CREATE: "workspace.create",
  WORKSPACE_LIST: "workspace.list",
  WORKSPACE_UPDATE: "workspace.update",
  WORKSPACE_DELETE: "workspace.delete",
  WORKSPACE_ACTIVATE: "workspace.activate",
  WORKSPACE_EVENT: "workspace.event",
  TAB_CREATE: "tab.create",
  TAB_CLOSE: "tab.close",
  TAB_ACTIVATE: "tab.activate",
  TAB_NAVIGATE: "tab.navigate",
  TAB_REORDER: "tab.reorder",
  TAB_LIST: "tab.list",
  TAB_EVENT: "tab.event",
  UI_EVENT: "ui.event",
  UI_SET_TOPBAR_HEIGHT: "ui.setTopbarHeight",
  UI_SET_CONTENT_BOUNDS: "ui.setContentBounds",
  BOOKMARK_LIST: "bookmark.list",
  BOOKMARK_ADD: "bookmark.add",
  BOOKMARK_REMOVE: "bookmark.remove",
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
