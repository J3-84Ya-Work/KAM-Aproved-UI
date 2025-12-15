/**
 * Role-based permission utilities
 */

export type UserRole = "KAM" | "H.O.D" | "Vertical Head" | "VerticalHead" | "VH" | "Purchase"

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
  const user = getCurrentUser()
  return user?.role === "Vertical Head" || user?.role === "VerticalHead" || user?.role === "VH"
}

/**
 * Check if user is Purchase (can answer rate queries)
 */
export function isPurchase(): boolean {
  return hasRole("Purchase")
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
export function getKAMsForHOD(hodName: HODName): readonly string[] {
  return HOD_KAM_MAPPING[hodName] || []
}

/**
 * Get HOD for a specific KAM
 */
export function getHODForKAM(kamName: string): HODName | null {
  for (const [hod, kams] of Object.entries(HOD_KAM_MAPPING)) {
    if ((kams as readonly string[]).includes(kamName)) {
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

/**
 * Check if current user should see only their own data
 * Returns the KAM name if user is a KAM, null otherwise
 */
export function getCurrentUserKAMName(): string | null {
  const user = getCurrentUser()
  if (!user || user.role !== "KAM") return null

  // The user's name should match one of the KAM names in the mapping
  const allKams = getAllKAMs()
  if (allKams.includes(user.name)) {
    return user.name
  }

  return null
}

/**
 * Check if current user can view all data (only Vertical Head)
 */
export function canViewAllData(): boolean {
  const user = getCurrentUser()
  if (!user) return false
  return user.role === "Vertical Head" || user.role === "VerticalHead" || user.role === "VH"
}

/**
 * Get current user's HOD name if they are an HOD
 * Returns the HOD name if user is an HOD, null otherwise
 */
export function getCurrentUserHODName(): string | null {
  const user = getCurrentUser()
  if (!user || user.role !== "H.O.D") return null

  // The user's name should match one of the HOD names in the mapping
  const allHods = getAllHODs()
  if (allHods.includes(user.name as HODName)) {
    return user.name
  }

  return null
}

/**
 * Get KAM names that the current user can view
 * - KAM users: only their own name
 * - HOD users: all KAMs under them
 * - Vertical Head: all KAMs
 */
export function getViewableKAMs(): string[] {
  const user = getCurrentUser()
  if (!user) return []

  // Vertical Head can see all KAMs
  if (user.role === "Vertical Head" || user.role === "VerticalHead" || user.role === "VH") {
    return getAllKAMs()
  }

  // HOD can see their KAMs
  if (user.role === "H.O.D") {
    const hodName = user.name as HODName
    if (HOD_KAM_MAPPING[hodName]) {
      return [...HOD_KAM_MAPPING[hodName]]
    }
  }

  // KAM can only see themselves
  if (user.role === "KAM") {
    const kamName = getCurrentUserKAMName()
    return kamName ? [kamName] : []
  }

  return []
}
