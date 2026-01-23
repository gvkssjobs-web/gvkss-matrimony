// Role-based access control utilities

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  photo?: string | null;
  phoneNumber?: string | null;
  profession?: string | null;
  age?: number | null;
  gender?: string | null;
}

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  admin: 2,
};

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Get user from localStorage (client-side)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}
