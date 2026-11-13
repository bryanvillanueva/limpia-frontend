/**
 * Green welcome gradient shared by the top bar and the dashboard banner.
 * Horizontal, so two stacked blocks of the same width read as one continuous surface.
 */
export const heroGradient = (t) => `linear-gradient(90deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`;

/** Routes where the top bar joins the green welcome banner. */
export const HERO_ROUTES = ['/dashboard'];
