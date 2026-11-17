---
tier: "PerContext"
intent: "Before adding or changing dashboard breadcrumbs, sidebar groups or links, navigation visibility or active state, or dashboard route structure."
---
# Navigation Boundaries

- Route folders, public URLs, sidebar metadata and breadcrumbs are four separate concerns. A parenthesised group organises pages without adding a URL segment; a plain segment becomes part of the URL. Fix the intended URL structure first, never by hiding a leaked segment in breadcrumbs.
- The dashboard layout owns the sidebar and breadcrumb shell. No session redirects to login; a signed-in user holding none of the dashboard's keys redirects to pending access. Every entry point reuses that same verdict.
- Sidebar groups are metadata, not routes and not landing pages. An item is visible when the user holds any one exact key of its section and hidden when they hold none; empty groups are removed. Hidden links are not authorization — keep the server-side checks.
- Active state matches the exact destination or a descendant at a slash boundary; a group is active when a visible child is. Active state and group expansion are separate, and expansion identity is the group title, so relabelling a group resets stored expansion.
- Collapsing the sidebar keeps every destination reachable with icons, tooltips and accessible names; a group heading is never a destination.
- Breadcrumbs derive cumulative links from the public pathname segments: every non-final segment links, the final one is the current page. They never verify destination existence, permissions or record names, so never assume an intermediate crumb is a reachable page.
- Breadcrumb labels come from the route, not from sidebar labels. Dynamic ids render as segment text rather than fetched titles; give a segment an explicit label only where its raw text would read badly.
