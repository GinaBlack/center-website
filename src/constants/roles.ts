export enum ROLES {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  USER = "user",
}

export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.INSTRUCTOR]: 2,
  [ROLES.ADMIN]: 3
};

export const hasMinimumRole = (userRole: ROLES, requiredRole: ROLES): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
export type UserRole = 'user' | 'instructor' | 'admin';