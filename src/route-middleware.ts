import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'

type SidebarEntry = StarlightRouteData['sidebar'][number]

/**
 * Route middleware that filters the sidebar to only show items
 * from the current page's top-level group.
 *
 * For example, if viewing a page in "User Guide", only User Guide
 * sidebar items are shown. Same for "Community", "Examples", etc.
 *
 * Also expands first-level groups by default.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals
  const { sidebar } = starlightRoute

  // Find which top-level group contains the current page
  const findCurrentInGroup = (items: SidebarEntry[]): boolean => {
    for (const item of items) {
      if (item.type === 'link' && item.isCurrent) return true
      if (item.type === 'group' && findCurrentInGroup(item.entries)) return true
    }
    return false
  }

  // Expand first-level groups (set collapsed to false)
  const expandFirstLevelGroups = (items: SidebarEntry[]): SidebarEntry[] => {
    return items.map((item) => {
      if (item.type === 'group') {
        return { ...item, collapsed: false }
      }
      return item
    })
  }

  // Find the top-level group that contains the current page
  for (const entry of sidebar) {
    if (entry.type === 'group' && findCurrentInGroup(entry.entries)) {
      // Replace sidebar with just this group's entries, with first-level expanded
      starlightRoute.sidebar = expandFirstLevelGroups(entry.entries)
      return
    }
  }

  // If no group found (e.g., top-level page), expand first-level groups anyway
  starlightRoute.sidebar = expandFirstLevelGroups(sidebar)
})
