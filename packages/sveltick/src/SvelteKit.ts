import { createTracker } from "./Tracker.js";
import type { Tracker, TrackerOptions } from "./Tracker.js";
import { createActivityTracker } from "./Activity.js";
import type { ActivityOptions, ActivityTracker } from "./Activity.js";

export interface SvelteKitHooks {
  afterNavigate(
    callback: (navigation: {
      to: { url: URL; route: { id: string | null } } | null;
    }) => void,
  ): void;
  onDestroy(callback: () => void): void;
}
export interface SvelteKitOptions {
  performance?: TrackerOptions;
  activity?: ActivityOptions;
}
export interface SvelteKitTracking {
  performance: Tracker;
  activity: ActivityTracker;
}

/** Call once during root layout initialization, supplying SvelteKit's hooks. */
export function connectSvelteKit(
  hooks: SvelteKitHooks,
  options: SvelteKitOptions = {},
): SvelteKitTracking {
  const performance = createTracker(options.performance);
  const activity = createActivityTracker(options.activity);
  let destroyed = false;
  hooks.afterNavigate((navigation) => {
    if (destroyed || !navigation.to) return;
    performance.start();
    void activity
      .recordNavigation({
        url: navigation.to.url,
        routeId: navigation.to.route.id,
      })
      .catch(() => {});
  });
  hooks.onDestroy(() => {
    destroyed = true;
    performance.dispose();
    activity.dispose();
  });
  return { performance, activity };
}
