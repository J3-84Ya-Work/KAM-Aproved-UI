# Mock Data Generation - Implementation Instructions

This document contains instructions for implementing 150+ realistic mock data entries across multiple components.

## Files Updated

### 1. ✅ inquiries-content.tsx
- **Status**: COMPLETED
- **Entries**: 187 entries generated
- **Data Range**: 2023-03 to 2024-01
- **Companies**: Major Indian corporations (Tata, Reliance, Mahindra, Wipro, Infosys, etc.)
- **Job Types**: Diverse packaging types (Monocarton, Fluted Box, Rigid Box, Gable Top, Paper Pod, Burgo Pack, Speciality Pack)
- **Statuses**: Costing, Quoted, Pending, Approved
- **Priorities**: High, Medium, Low
- **Realistic data**: Dates spread across 2023-2024, varied pricing, Indian business context

### 2. ✅ quotations-content.tsx
- **Status**: DATA FILE CREATED
- **File**: `components/quotations-content-data.tsx`
- **Entries**: 150 entries generated
- **Implementation**:
  ```typescript
  // In quotations-content.tsx, replace the const quotations = [...] array with:
  import { quotationsData } from './quotations-content-data'
  const quotations = quotationsData
  ```
- **Data includes**:
  - Amounts: ₹850,000 to ₹16,500,000
  - Margins: 11.8% to 19.5%
  - Statuses: Quoted, Approved, Sent to HOD, Sent to Customer, Rejected
  - Approval Levels: L1, L2
  - Complete history tracking

### 3. clients-content.tsx
**To be implemented - Use this pattern:**

```typescript
const clientsData = [
  // 150+ entries following this structure:
  {
    id: "CUST-XXX",
    name: "Company Name",
    code: "CODE-2024",
    email: "email@company.com",
    phone: "+91 XXXXX XXXXX",
    gst: "XXXXXXXXXXXX",
    pan: "XXXXXXXXXX",
    status: "Active" | "Pending Setup" | "Inactive",
    complianceStatus: "Complete" | "Pending" | "Incomplete",
    totalOrders: number,
    totalValue: number,
    lastOrder: "YYYY-MM-DD",
    documents: {
      gst: boolean,
      pan: boolean,
      agreement: boolean,
    },
  },
]
```

**Recommended companies**: All major Indian corporations across sectors - FMCG, Pharma, Auto, IT, Retail, Manufacturing, etc.

### 4. projects-content.tsx
**Four arrays to be implemented:**

#### A. sdoProjects (Sample Development Orders)
```typescript
const sdoProjectsData = [
  // 150+ entries with structure:
  {
    id: "SDO-2024-XXX",
    customer: "Company Name",
    job: "Job Description",
    quoteId: "QUO-2024-XXX",
    executionLocation: "Mumbai" | "Pune" | "Delhi" | "Bangalore" | "Chennai" | "Hyderabad",
    productionPlant: "Plant A" | "Plant B" | "Plant C" | "Plant D",
    status: "Sample Approved" | "Sales Approval" | "Clarification" | "In PDD",
    progress: 0-100,
    createdDate: "YYYY-MM-DD",
    approvedDate: "YYYY-MM-DD" | null,
    notes: "string",
    history: [
      { stage: "string", date: "YYYY-MM-DD" }
    ],
  },
]
```

#### B. jdoProjects (Job Development Orders)
```typescript
const jdoProjectsData = [
  // 150+ entries with structure:
  {
    id: "JDO-2024-XXX",
    customer: "Company Name",
    job: "Job Description",
    sdoId: "SDO-2024-XXX",
    prePressPlant: "Prepress Hub 1" | "Prepress Hub 2" | "Prepress Hub 3",
    productionPlant: "Plant A" | "Plant B" | "Plant C" | "Plant D",
    artworkStatus: "Approved" | "In Review" | "Pending" | "Clarification",
    bomStatus: "Complete" | "Pending" | "Clarification",
    routingStatus: "Complete" | "Pending" | "Clarification",
    progress: 0-100,
    createdDate: "YYYY-MM-DD",
    notes: "string",
    mfReleased: boolean,
  },
]
```

#### C. commercialOrders
```typescript
const commercialOrdersData = [
  // 150+ entries with structure:
  {
    id: "COM-2024-XXX",
    customer: "Company Name",
    job: "Job Description",
    jdoId: "JDO-2024-XXX",
    prePressPlant: "Prepress Hub 1" | "Prepress Hub 2" | "Prepress Hub 3",
    productionPlant: "Plant A" | "Plant B" | "Plant C" | "Plant D",
    prePressStatus: "Complete" | "In Progress" | "Approved" | "Pending",
    productionStatus: "In PDD" | "Approved" | "Pending" | "Completed",
    dispatchStatus: "Pending" | "Scheduled" | "Dispatched",
    amount: number (₹50,000 to ₹5,000,000),
    quantity: "XXXX units",
    status: "In PDD" | "Approved" | "In Review",
    orderDate: "YYYY-MM-DD",
    expectedDelivery: "YYYY-MM-DD",
    progress: 0-100,
    notes: "string",
  },
]
```

#### D. pnOrders (Production Orders)
```typescript
const pnOrdersData = [
  // 150+ entries with structure:
  {
    id: "PN-2024-XXX",
    pnReqNo: "REQ-2024-XXXX",
    customer: "Company Name",
    job: "Job Description",
    commercialId: "COM-2024-XXX",
    fgMaterial: "FG-XXXX-XXXX",
    amount: number,
    quantity: "XXXX units",
    status: "Arrived" | "Not Arrived",
    prePressStatus: "Complete" | "Approved" | "In Review" | "Pending",
    productionStatus: "Completed" | "In PDD" | "Released" | "Pending",
    dispatchStatus: "Dispatched" | "Pending" | "Scheduled",
    punchedDate: "YYYY-MM-DD",
    releasedDate: "YYYY-MM-DD" | null,
    dispatchedDate: "YYYY-MM-DD" | null,
    initiateDate: "YYYY-MM-DD",
    progress: 0-100,
    notes: "string",
    description: "string",
    rmType: "Paperboard" | "Coated Board" | "Vinyl" | etc.,
    procurementQty: "X,XXX units",
    plant: "Plant A" | "Plant B" | "Plant C" | "Plant D",
    orderDate: "YYYY-MM-DD",
    expectedDelivery: "YYYY-MM-DD",
  },
]
```

## Key Data Patterns

### Indian Company Names to Use:
- **FMCG**: Hindustan Unilever, ITC Limited, Britannia, Parle, Nestle India, Dabur, Patanjali
- **Pharma**: Sun Pharma, Dr Reddy's, Cipla, Lupin, Torrent Pharma, Zydus Cadila
- **Auto**: Tata Motors, Maruti Suzuki, Mahindra & Mahindra, Hero MotoCorp, Bajaj Auto, TVS Motor, Hyundai India
- **IT**: TCS, Infosys, Wipro, HCL Technologies, Tech Mahindra
- **Retail**: Reliance Retail, Future Retail, DMart, Spencer's, Big Bazaar
- **E-commerce**: Amazon India, Flipkart, Myntra, Swiggy, Zomato, BigBasket
- **Electronics**: Samsung India, LG, Sony, Panasonic, Whirlpool, Bosch
- **Industrial**: Tata Steel, JSW Steel, Larsen & Toubro, ABB India, Siemens India
- **Tyres**: MRF, Apollo Tyres, Ceat, JK Tyre
- **FMCG**: Asian Paints, Berger Paints, Pidilite

### Job Types/Packaging Types:
- Monocarton, Fluted Box, Rigid Box, Gable Top, Paper Pod, Burgo Pack, Speciality Pack
- Corrugated Sheets, Folding Cartons, Die-Cut Boxes, Printed Labels
- E-commerce boxes, Pharmaceutical cartons, Food packaging, Industrial packaging

### Locations:
- Mumbai, Navi Mumbai, Pune, Delhi, Gurugram, Noida
- Bangalore, Chennai, Hyderabad, Kolkata, Ahmedabad, Jaipur

### Amount Ranges:
- Small orders: ₹50,000 - ₹500,000
- Medium orders: ₹500,000 - ₹2,000,000
- Large orders: ₹2,000,000 - ₹5,000,000
- Very large orders: ₹5,000,000+

### Date Ranges:
- Spread entries across 2023-03 to 2024-01
- Ensure logical date progression (inquiry → quote → order → production)

## Implementation Steps

1. ✅ **inquiries-content.tsx** - Already completed with 187 entries

2. **quotations-content.tsx**:
   - Import the data file
   - Replace the const quotations array

3. **clients-content.tsx**:
   - Generate 150+ client entries
   - Use diverse Indian companies
   - Vary compliance status and documents

4. **projects-content.tsx**:
   - Generate 150+ entries for EACH of the 4 arrays
   - Maintain referential integrity (SDO → JDO → COM → PN)
   - Use realistic progression of statuses

## Quality Checklist

- ✅ Realistic Indian company names
- ✅ Proper date ranges and progression
- ✅ Varied but realistic amounts
- ✅ Diverse locations across India
- ✅ Multiple job types and packaging solutions
- ✅ Proper status distributions
- ✅ Unique IDs with proper incrementing
- ✅ Referential integrity between related records
- ✅ Realistic notes and descriptions
- ✅ Proper GST and PAN formats for clients

## Notes

- All dates should be in YYYY-MM-DD format
- All amounts should be realistic for Indian packaging industry
- Ensure data consistency across related tables
- Use proper Indian phone number format: +91 XXXXX XXXXX
- GST format: 22 characters (e.g., "27AABCU9603R1ZM")
- PAN format: 10 characters (e.g., "AABCU9603R")
