import { createContext, useContext } from 'react';

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 76;
export const SIDEBAR_STORAGE_KEY = 'limpia_sidebar_collapsed';

export const LayoutContext = createContext({
  collapsed: false,
  toggleCollapsed: () => {},
  drawerWidth: DRAWER_WIDTH,
});

/** { collapsed, toggleCollapsed, drawerWidth } of the desktop sidebar. */
export const useLayout = () => useContext(LayoutContext);
