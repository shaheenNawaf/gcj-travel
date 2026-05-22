/**
 * Role-Based Access Control (RBAC) Permission Matrix
 * Edit this file to add new roles (e.g., 'manager', 'editor') or alter permissions
 * without changing any structural code or layout files.
 */

// 1. Define distinct roles
export const ROLES = {
  SUPERADMIN: 'superadmin', // Full owner access
  AGENT: 'agent',           // Standard travel agent staff
  EDITOR: 'editor'          // Optional: content-only editor (extensible example)
};

// 2. Define the permission matrix mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    allowedPages: ['/admin/dashboard', '/admin/inquiries', '/admin/packages', '/admin/staff'],
    allowedActions: ['create_packages', 'edit_packages', 'delete_packages', 'manage_staff']
  },
  [ROLES.AGENT]: {
    allowedPages: ['/admin/dashboard', '/admin/inquiries', '/admin/packages'],
    allowedActions: ['edit_packages'] // Can view leads and edit, but not delete or manage staff [1]
  },
  [ROLES.EDITOR]: {
    allowedPages: ['/admin/dashboard', '/admin/packages'],
    allowedActions: ['create_packages', 'edit_packages'] // Can only manage products
  }
};

// 3. Bind abstract permissions directly to CSS selectors
// This completely decouples your HTML from role names!
export const ACTION_SELECTORS = {
  delete_packages: '.superadmin-only', // Hides delete buttons [1]
  manage_staff: '.superadmin-only',    // Hides staff settings tabs [1]
  create_packages: '.create-package-only'
};

/**
 * Route protection guard
 * Checks if a specific role is permitted to view a given page route
 */
export function isPageAllowed(role, pathname) {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Exact match or base path checking
  return permissions.allowedPages.some(pageRoute => {
    if (pageRoute === pathname) return true;
    // Handles wildcard routes (e.g. /admin/packages matches edit sub-pages)
    if (pageRoute !== '/admin/dashboard' && pathname.startsWith(pageRoute)) return true;
    return false;
  });
}