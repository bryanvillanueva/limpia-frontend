import { useState, useCallback, useMemo } from 'react';
import { LayoutContext, DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH, SIDEBAR_STORAGE_KEY } from './layoutState';

const readCollapsed = () => {
  try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'; } catch { return false; }
};

/**
 * Shared layout state: whether the desktop sidebar is collapsed (icons only).
 * The choice is remembered per browser. On mobile the sidebar is a temporary drawer and ignores it.
 */
export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0'); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, drawerWidth: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH }),
    [collapsed, toggleCollapsed],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
