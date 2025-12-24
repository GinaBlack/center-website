export enum ROLES {
  CENTER_ADMIN = 'center_admin',
  SUPER_ADMIN = 'super_admin',
  INSTRUCTOR = "instructor",
  USER = "user",
}

export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.INSTRUCTOR]: 2,
  [ROLES.CENTER_ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4
};


export const hasMinimumRole = (userRole: ROLES, requiredRole: ROLES): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
export type UserRole = 'user' | 'instructor' | 'center_admin' | 'super_admin';