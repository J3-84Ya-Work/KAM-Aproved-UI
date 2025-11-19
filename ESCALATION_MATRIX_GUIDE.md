# 📊 Login & Hierarchy System - Escalation Matrix Guide

## 🏢 Current Organizational Hierarchy

### **4-Level Structure:**

```
Vertical Head (Level 4 - Highest Authority)
    ↓
H.O.D (Level 3 - Department Heads)
    ↓
KAM (Level 2 - Key Account Managers)
    ↓
Purchase (Level 1 - Support Team)
```

---

## 👥 Users & Their Roles

### **Location:** `app/login/page.tsx` (Lines 13-22)

| Email | Name | Role | Level | Reports To |
|-------|------|------|-------|------------|
| rajesh@parksons.com | Rajesh Kumar | KAM | L2 | Suresh Menon (HOD) |
| amit@parksons.com | Amit Patel | KAM | L2 | Suresh Menon (HOD) |
| priya@parksons.com | Priya Sharma | KAM | L2 | Kavita Reddy (HOD) |
| sneha@parksons.com | Sneha Gupta | KAM | L2 | Kavita Reddy (HOD) |
| suresh@parksons.com | Suresh Menon | H.O.D | L3 | Vertical Head |
| kavita@parksons.com | Kavita Reddy | H.O.D | L3 | Vertical Head |
| vertical@parksons.com | Vertical Head | Vertical Head | L4 | None (Top Authority) |
| purchase@parksons.com | Purchase Manager | Purchase | L1 | N/A (Support) |

---

## 🔗 Reporting Hierarchy (HOD-KAM Mapping)

### **Location:** `lib/permissions.ts` (Lines 103-106)

```typescript
export const HOD_KAM_MAPPING = {
  "Suresh Menon": ["Rajesh Kumar", "Amit Patel"],      // Team 1
  "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],     // Team 2
}
```

### **Visual Hierarchy:**

```
┌─────────────────────────────────────┐
│       Vertical Head (L4)            │
│    (Final Approval Authority)       │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Suresh Menon │    │ Kavita Reddy │
│   (HOD L3)   │    │   (HOD L3)   │
└──────┬───────┘    └──────┬───────┘
       │                   │
   ┌───┴────┐          ┌───┴────┐
   ▼        ▼          ▼        ▼
┌──────┐ ┌──────┐  ┌──────┐ ┌──────┐
│Rajesh│ │ Amit │  │Priya │ │Sneha │
│ KAM  │ │ KAM  │  │ KAM  │ │ KAM  │
└──────┘ └──────┘  └──────┘ └──────┘
```

---

## 📈 Escalation Matrix for Rate Queries

### **Current Flow:**

1. **KAM** creates rate request → Purchase team
2. **Purchase** answers → Back to KAM
3. **Purchase** can escalate → HOD
4. **HOD** can escalate → Vertical Head

### **Escalation Path Example:**

```
Request Created by: Rajesh Kumar (KAM)
        ↓
Assigned to: Purchase Manager
        ↓
If Purchase can't answer → Escalate
        ↓
Escalate to: Suresh Menon (Rajesh's HOD)
        ↓
If HOD can't answer → Escalate
        ↓
Escalate to: Vertical Head (Final Authority)
```

---

## 🔑 Key Functions Available (lib/permissions.ts)

### **Get User's HOD:**
```typescript
import { getHODForKAM } from '@/lib/permissions'

const hodName = getHODForKAM("Rajesh Kumar")
// Returns: "Suresh Menon"
```

### **Get KAMs under HOD:**
```typescript
import { getKAMsForHOD } from '@/lib/permissions'

const kams = getKAMsForHOD("Suresh Menon")
// Returns: ["Rajesh Kumar", "Amit Patel"]
```

### **Get All HODs:**
```typescript
import { getAllHODs } from '@/lib/permissions'

const hods = getAllHODs()
// Returns: ["Suresh Menon", "Kavita Reddy"]
```

### **Get All KAMs:**
```typescript
import { getAllKAMs } from '@/lib/permissions'

const kams = getAllKAMs()
// Returns: ["Rajesh Kumar", "Amit Patel", "Priya Sharma", "Sneha Gupta"]
```

### **Check Current User Role:**
```typescript
import { getCurrentUser, isKAM, isHOD, isVerticalHead, isPurchase } from '@/lib/permissions'

const user = getCurrentUser()
// Returns: { name: "Rajesh Kumar", email: "rajesh@parksons.com", role: "KAM", loggedInAt: "..." }

if (isKAM()) {
  // User is KAM
}

if (isHOD()) {
  // User is HOD
}

if (isVerticalHead()) {
  // User is Vertical Head
}

if (isPurchase()) {
  // User is Purchase
}
```

---

## 🎯 Implementing Auto-Escalation Logic

### **Scenario 1: Auto-escalate based on KAM's HOD**

```typescript
import { getHODForKAM, getCurrentUser } from '@/lib/permissions'

// When KAM creates rate request
const currentUser = getCurrentUser()
if (currentUser?.role === 'KAM') {
  const assignedHOD = getHODForKAM(currentUser.name)
  console.log(`Request from ${currentUser.name} → Escalate to ${assignedHOD}`)
}

// Example Output:
// Request from Rajesh Kumar → Escalate to Suresh Menon
```

### **Scenario 2: Escalation Chain**

```typescript
const escalationChain = (kamName: string) => {
  const hod = getHODForKAM(kamName)
  return {
    level1: "Purchase Manager",      // First responder
    level2: hod,                      // KAM's HOD
    level3: "Vertical Head",          // Final authority
  }
}

// Example:
const chain = escalationChain("Priya Sharma")
// Returns:
// {
//   level1: "Purchase Manager",
//   level2: "Kavita Reddy",
//   level3: "Vertical Head"
// }
```

---

## 📋 Escalation Matrix Table

| Request From | Level 1 (Auto) | Level 2 (Manual) | Level 3 (Final) |
|--------------|----------------|------------------|-----------------|
| Rajesh Kumar (KAM) | Purchase Manager | Suresh Menon (HOD) | Vertical Head |
| Amit Patel (KAM) | Purchase Manager | Suresh Menon (HOD) | Vertical Head |
| Priya Sharma (KAM) | Purchase Manager | Kavita Reddy (HOD) | Vertical Head |
| Sneha Gupta (KAM) | Purchase Manager | Kavita Reddy (HOD) | Vertical Head |

---

## 🛠️ How to Modify Hierarchy

### **Add New KAM under HOD:**

**File:** `lib/permissions.ts` (Line 103-106)

```typescript
export const HOD_KAM_MAPPING = {
  "Suresh Menon": ["Rajesh Kumar", "Amit Patel", "New KAM Name"],  // ← Add here
  "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],
}
```

### **Add New HOD:**

**Step 1:** Add user to login page (`app/login/page.tsx`)
```typescript
{ email: "newhod@parksons.com", password: "newhod@123", name: "New HOD Name", role: "H.O.D" },
```

**Step 2:** Add to hierarchy mapping (`lib/permissions.ts`)
```typescript
export const HOD_KAM_MAPPING = {
  "Suresh Menon": ["Rajesh Kumar", "Amit Patel"],
  "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],
  "New HOD Name": ["KAM 1", "KAM 2"],  // ← Add new HOD with their KAMs
}
```

---

## 💡 Recommendation for Escalation Matrix

### **Suggested Implementation:**

1. **Auto-assign to Purchase** when KAM creates request
2. **Manual escalate to HOD** if Purchase can't answer (using `getHODForKAM()`)
3. **Manual escalate to Vertical Head** if HOD can't answer
4. **Track escalation level** in request status

### **Database Fields Needed:**

```typescript
interface RateRequest {
  requestId: number
  requestorId: number
  requestorName: string
  department: string
  requestMessage: string
  status: 'pending' | 'responded' | 'escalated_hod' | 'escalated_vh' | 'completed'
  assignedTo: string         // Current person handling request
  escalationLevel: 1 | 2 | 3  // 1=Purchase, 2=HOD, 3=Vertical Head
  escalationHistory: Array<{
    from: string
    to: string
    timestamp: string
    reason?: string
  }>
}
```

---

## 🔍 Example: Complete Escalation Flow

```typescript
// Step 1: KAM creates request
const createRequest = (kamName: string, message: string) => {
  const hod = getHODForKAM(kamName)

  return {
    requestorName: kamName,
    assignedTo: "Purchase Manager",
    escalationLevel: 1,
    escalationChain: {
      level1: "Purchase Manager",
      level2: hod,
      level3: "Vertical Head"
    }
  }
}

// Step 2: Purchase escalates to HOD
const escalateToHOD = (requestId: number, kamName: string) => {
  const hod = getHODForKAM(kamName)

  return {
    requestId,
    assignedTo: hod,
    escalationLevel: 2,
    status: 'escalated_hod'
  }
}

// Step 3: HOD escalates to Vertical Head
const escalateToVH = (requestId: number) => {
  return {
    requestId,
    assignedTo: "Vertical Head",
    escalationLevel: 3,
    status: 'escalated_vh'
  }
}
```

---

## ✅ Summary

**Your system has:**
- ✅ 4 user roles (KAM, HOD, Vertical Head, Purchase)
- ✅ 2 HOD teams with 2 KAMs each
- ✅ Clear reporting hierarchy (HOD_KAM_MAPPING)
- ✅ Helper functions to get relationships
- ✅ Perfect structure for escalation matrix

**For Escalation Matrix, you can:**
- ✅ Auto-route requests based on KAM → HOD mapping
- ✅ Track escalation levels (Purchase → HOD → VH)
- ✅ Show escalation history
- ✅ Send notifications at each level

---

**Files to Reference:**
- User List: `app/login/page.tsx` (Lines 13-22)
- Hierarchy: `lib/permissions.ts` (Lines 103-106)
- Helper Functions: `lib/permissions.ts` (Lines 114-210)
