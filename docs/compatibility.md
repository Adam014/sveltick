# Browser compatibility

Sveltick detects each measurement API independently. Browser names are not a
substitute for checking `snapshot.metrics[name].status` in the running app.

The current development source has been exercised in Chrome 150, Playwright Firefox 156 and
Playwright WebKit 26.6 on macOS arm64. WebKit automation is not a claim that every
Safari release or iOS device has been tested.

| Behavior in these browser builds | Chrome | Firefox | WebKit |
| --- | --- | --- | --- |
| FCP, LCP, TTFB numeric results | Observed | Observed | Observed |
| INP after a slow click | Observed | Observed | Observed |
| CLS | Observed | Unsupported | Unsupported |
| No-input INP | Pending/null | Pending/null | Pending/null |
| Bounded compatibility collection | Completes | Completes | Completes |
| Transactional activity across two tabs | Supported | Supported | Supported |

These are version-specific observations, not a permanent engine support table.
Future browser builds may expose additional entry types; Sveltick can use them
without adding user-agent rules. Missing metrics remain explicit, and reports
with incomplete data do not receive a custom score.

## Lifecycle limits

A hidden page flushes the backend's available results. Background throttling or
a suspended document can delay JavaScript timers, so collection and export
timeouts are event-loop deadlines, not wall-clock guarantees while suspended.

A full reload or normal history navigation creates a new document. A bfcache
restore keeps the page's JavaScript environment, so Sveltick listens for
`pageshow.persisted`, clears old metric values and changes its document ID before
the backend reports restored measurements. Instance activity and bounded history
retain their own documented scope. Browser automation can disable bfcache; a
normal back navigation alone does not demonstrate a cache restore.

Late initialization uses buffered performance entries where available. It
cannot recover arbitrary past interaction events that the browser no longer
retains. Start the tracker early in the root layout for best coverage.

`stop()` detaches the instance's subscription; the shared document backend
remains alive. Repeated starts and module reloads share that backend. A hot
reload that remounts the root layout may record an additional development-only
initial visit. Production navigation is the reference for visit semantics.

## Other environments

ESM and CommonJS imports work without a DOM. SSR snapshots show unsupported
browser metrics and activity calls do not invent browser visits. Contributor
builds use Node 22.12+; CI covers Node 22, 24 and 26. Browser feature detection,
not the Node version used to build your app, determines runtime metric coverage.

No physical Android/iOS device or embedded WebView support claim is implied by
this desktop browser coverage. Core APIs remain feature-detected on those
platforms. Verify your own browser versions and privacy/storage policies before
relying on persistent counts.
