/**
 * Role-based permission utilities
 */

export type UserRole = "KAM" | "H.O.D" | "Vertical Head"

export interface UserAuth {
  name: string
  email: string
  role: UserRole
  loggedInAt: string
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): UserAuth | null {
  if (typeof window === "undefined") return null

  const authData = localStorage.getItem("userAuth")
  if (!authData) return null

  try {
    return JSON.parse(authData) as UserAuth
  } catch {
    return null
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser()
  return user?.role === role
}

/**
 * Check if user is KAM (can create inquiries/quotations)
 */
export function isKAM(): boolean {
  return hasRole("KAM")
}

/**
 * Check if user is HOD (can approve items sent by KAM)
 */
export function isHOD(): boolean {
  return hasRole("H.O.D")
}

/**
 * Check if user is Vertical Head (can approve items sent by HOD)
 */
export function isVerticalHead(): boolean {
  return hasRole("Vertical Head")
}

/**
 * Check if user can create new items (only KAM)
 */
export function canCreate(): boolean {
  return isKAM()
}

/**
 * Check if user can approve items (HOD or Vertical Head)
 */
export function canApprove(): boolean {
  return isHOD() || isVerticalHead()
}

/**
 * Get approval level for current user
 * HOD = Level 1 (L1), Vertical Head = Level 2 (L2)
 */
export function getApprovalLevel(): "L1" | "L2" | null {
  if (isHOD()) return "L1"
  if (isVerticalHead()) return "L2"
  return null
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(): string {
  const user = getCurrentUser()
  if (!user) return "Guest"
  return user.role
}

/**
 * HOD-KAM Mapping
 * Defines which KAMs report to which HODs
 */
export const HOD_KAM_MAPPING = {
  "Suresh Menon": ["Rajesh Kumar", "Amit Patel"],
  "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],
} as const

export type HODName = keyof typeof HOD_KAM_MAPPING
export type KAMName = typeof HOD_KAM_MAPPING[HODName][number]

/**
 * Get all HOD names
 */
export function getAllHODs(): HODName[] {
  return Object.keys(HOD_KAM_MAPPING) as HODName[]
}

/**
 * Get KAMs under a specific HOD
 */
export function getKAMsForHOD(hodName: HODName): string[] {
  return HOD_KAM_MAPPING[hodName] || []
}

/**
 * Get HOD for a specific KAM
 */
export function getHODForKAM(kamName: string): HODName | null {
  for (const [hod, kams] of Object.entries(HOD_KAM_MAPPING)) {
    if (kams.includes(kamName as any)) {
      return hod as HODName
    }
  }
  return null
}

/**
 * Get all KAMs across all HODs
 */
export function getAllKAMs(): string[] {
  return Object.values(HOD_KAM_MAPPING).flat()
}
