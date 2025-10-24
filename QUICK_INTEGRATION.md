# Quick Integration Guide - Copy & Paste Ready

## File 1: quotations-content.tsx

**Location**: Line 21 (where `const quotations = [` starts)

```typescript
// ADD THIS IMPORT AT THE TOP (around line 20)
import { quotationsData } from './quotations-content-data'

// REPLACE THIS:
// const quotations = [ ... ]

// WITH THIS:
const quotations = quotationsData
```

---

## File 2: clients-content.tsx

**Location**: Line 20 (where `const clients = [` starts)

```typescript
// ADD THIS IMPORT AT THE TOP (around line 19)
import { clientsData } from './clients-content-data'

// REPLACE THIS:
// const clients = [ ... ]

// WITH THIS:
const clients = clientsData
```

---

## File 3: projects-content.tsx

**Location**: Lines 22, 95, 128, 185 (where the 4 arrays start)

```typescript
// ADD THESE IMPORTS AT THE TOP (around line 21)
import { sdoProjectsData } from './sdo-projects-data'
import { jdoProjectsData } from './jdo-projects-data'
import { commercialOrdersData } from './commercial-orders-data'
import { pnOrdersData } from './pn-orders-data'

// REPLACE THESE FOUR ARRAYS:

// 1. REPLACE:
// const sdoProjects = [ ... ]
// WITH:
const sdoProjects = sdoProjectsData

// 2. REPLACE:
// const jdoProjects = [ ... ]
// WITH:
const jdoProjects = jdoProjectsData

// 3. REPLACE:
// const commercialOrders = [ ... ]
// WITH:
const commercialOrders = commercialOrdersData

// 4. REPLACE:
// const pnOrders = [ ... ]
// WITH:
const pnOrders = pnOrdersData
```

---

## ✅ Verification

After making these changes, verify:

1. **Inquiries page**: Should show 187 entries (already done)
2. **Quotations page**: Should show 150 entries
3. **Clients page**: Should show 150 entries
4. **Projects SDO tab**: Should show 150 entries
5. **Projects JDO tab**: Should show 150 entries
6. **Projects Commercial tab**: Should show 150 entries
7. **Projects PN tab**: Should show 150 entries

**Total**: 937 entries across all tables

---

## 🔧 Alternative: Direct File Replacement

If you prefer, you can also:

1. Open each data file (e.g., `quotations-content-data.tsx`)
2. Copy the entire array
3. Paste it directly replacing the existing array in the component file

This achieves the same result without using imports.

---

## 🎯 Expected Result

Each table should now display:
- Diverse, realistic Indian company names
- Varied dates across 2023-2024
- Different statuses and progress levels
- Realistic amounts in Indian Rupees
- Proper GST, PAN, and phone number formats
- Complete search and filter functionality with large datasets
