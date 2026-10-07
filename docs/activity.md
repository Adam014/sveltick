# Navigation activity and persistence

`createActivityTracker()` records explicit navigation events in an isolated
memory instance. `recordNavigation({ url, routeId?, id? })` returns a Promise
with the confirmed snapshot. Every call represents a new visit unless its ID
already exists in retained history. `/ → /about → /` is three visits. A query
or fragment change is a visit when your router emits a completed navigation,
but query strings and fragments are never stored. Prefer a route template
such as `/users/[id]` to avoid recording identifying path segments.

```ts
import { createActivityTracker } from 'sveltick';
const activity = createActivityTracker({
  storage: 'indexeddb', namespace: 'my-app', maxEntries: 200
});
await activity.recordNavigation({url: location.href, routeId: '/users/[id]'});
const snapshot = await activity.getSnapshot();
activity.dispose();
```

The opt-in `indexeddb` mode uses database `sveltick:v2:<namespace>` and one
transactional state record. Concurrent tabs serialize read/write transactions;
confirmed events do not overwrite each other's counters. `getSnapshot()` reads
fresh shared state; subscriptions report operations by this instance, not live
notifications from other tabs. The namespace must contain 1–80 letters, digits,
underscores or hyphens. Open/transaction attempts have a two-second timer; event
loop suspension can delay it. Blocked or failed persistence switches this
instance to memory with `persistenceError: true`, continuing from its last
observed state. Cross-tab consistency is only claimed in IndexedDB mode.

Snapshots contain schema version, persistence and scope, page views since reset,
a browser-local visitor ID, session ID, recent route records and source counts.
They do not contain a site-wide visitor count. Persistent session IDs use a
namespaced sessionStorage key; inaccessible sessionStorage uses an instance ID.
Duplicated tabs can inherit a session ID from the browser. An attribution session
is counted once while its ID is retained and active. Referrers are classified
by hostname: facebook.com/fb.com and their subdomains; google.com, google.cz,
google.co.uk, google.de, google.fr, google.es, google.it, google.com.au and
google.co.jp and their subdomains. Other or invalid referrers are Others; an
empty referrer is Direct. No full referrer URL is stored.

`maxEntries` defaults to 200, clamped to 1–1000. `retentionMs` defaults to seven
days, clamped to 1 ms–30 days. Recent routes are bounded by both settings;
source session bookkeeping is bounded to 1000 entries and the retention window.
Page-view and source counters are totals since reset, not counts of the retained
list. Deduplication only covers retained navigation IDs. Caller-supplied IDs
must be non-empty and at most 200 characters.

`subscribe(callback)` immediately reports the cached state, then reports local
operations. Callback failures are isolated and every result is a defensive
copy. Use `getSnapshot()` to load persisted state explicitly. `reset()` clears
activity and visitor identity for this namespace in a transaction; the next
visit creates a new identity. `dispose()` closes this instance's connection
and removes subscribers. Already submitted operations may still finish; no
subscriber notifications are sent after disposal. SSR returns empty state and
records no visits. Nothing is sent to a network service by the library.

The synchronous legacy `trackAllActivities()` now counts every explicit visit
and retains repeat paths. Its old localStorage persistence remains non-atomic
across tabs. Use the new asynchronous API for shared persistent counters.
