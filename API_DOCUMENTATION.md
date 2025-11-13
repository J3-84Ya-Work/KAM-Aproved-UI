# Dynamic Fill Costing - API Documentation

This document outlines all APIs used in the Dynamic Fill Costing wizard, including headers, methods, request bodies, and responses.

---

## Base Configuration

**Base URL**: `https://api.indusanalytics.co.in`

### Common Headers (All APIs)

```
Authorization: Basic <base64(parksonsnew:parksonsnew)>
CompanyID: 2
UserID: 2
Fyear: 2025-2026
ProductionUnitID: 1
Content-Type: application/json
```

---

## API Flow Overview

```
User Flow:
1. Fill Form (Steps 1-4)
2. Click "Get Plans" (Step 5) → SaveMultipleEnquiry + ShirinJob
3. Select Plan (Step 6) → Click "Create Quotation"
4. Create Quotation → DirectCosting + GetQuotationDetail
5. View Quotation (Step 7)
```

---

## Dropdown/Metadata APIs

These APIs are used to populate dropdown options in the form (Steps 1-4). They are called when user selects parent values.

### API 1: Get Content Types (Carton Types)

**Purpose**: Fetches list of available carton/content types.

**Trigger**: When form loads or category changes.

**Method**: `GET`

**Endpoint**: `/api/planwindow/GetCategoryAllocatedContents/{categoryId}`

**Example**: `/api/planwindow/GetCategoryAllocatedContents/0`

**Headers**: Common headers (see above)

**URL Parameters**:
- `categoryId`: Category ID (use `0` for all content types)

**Response** (200):
```json
[
  {
    "ContentID": 1,
    "ContentName": "Reverse Tuck In",
    "ContentType": "ReverseTuckIn",
    "CategoryID": 2,
    "RequiredDimensions": ["Length", "Width", "Height", "OpenFlap", "PastingFlap"]
  },
  {
    "ContentID": 2,
    "ContentName": "Straight Tuck In",
    "ContentType": "StraightTuckIn",
    "CategoryID": 2,
    "RequiredDimensions": ["Length", "Width", "Height", "OpenFlap"]
  }
]
```

**Usage Notes**:
- CategoryID 0 returns all content types
- CategoryID 2 returns only carton/box types
- ContentType is used in API calls (no spaces)
- ContentName is displayed in UI

---

### API 2: Get Quality Options

**Purpose**: Fetches quality/board type options for selected content type.

**Trigger**: When user selects carton type.

**Method**: `GET`

**Endpoint**: `/api/planwindow/quality/{contentType}`

**Example**: `/api/planwindow/quality/ReverseTuckIn`

**Headers**: Common headers (see above)

**URL Parameters**:
- `contentType`: Content type name (no spaces, e.g., "ReverseTuckIn")

**Response** (200):
```json
[
  {
    "Quality": "ALPHA GREY BACK",
    "QualityID": 123
  },
  {
    "Quality": "KAPPA GREY BACK",
    "QualityID": 124
  },
  {
    "Quality": "WHITE BACK",
    "QualityID": 125
  }
]
```

**Common Quality Types**:
- ALPHA GREY BACK
- KAPPA GREY BACK
- WHITE BACK
- DUPLEX BOARD
- SBS (Solid Bleached Sulfate)
- CCNB (Clay Coated News Back)

**Usage Notes**:
- Quality must be selected before GSM can be fetched
- Different content types may have different quality options
- Response may be double-encoded JSON (handled automatically)

---

### API 3: Get GSM Options

**Purpose**: Fetches available GSM (paper thickness) options for selected quality.

**Trigger**: When user selects quality.

**Method**: `GET`

**Endpoint**: `/api/planwindow/gsm/{contentType}/{quality}/{thickness}`

**Example**: `/api/planwindow/gsm/ReverseTuckIn/ALPHA%20GREY%20BACK/0`

**Headers**: Common headers (see above)

**URL Parameters**:
- `contentType`: Content type (e.g., "ReverseTuckIn")
- `quality`: Quality name (URL encoded, e.g., "ALPHA%20GREY%20BACK")
- `thickness`: Thickness value (default: "0")

**Response** (200):
```json
[
  {
    "GSM": "215",
    "GSMID": 1,
    "GSMValue": 215
  },
  {
    "GSM": "250",
    "GSMID": 2,
    "GSMValue": 250
  },
  {
    "GSM": "300",
    "GSMID": 3,
    "GSMValue": 300
  }
]
```

**Common GSM Values**:
- 150, 175, 200, 215, 250, 300, 350, 400

**Usage Notes**:
- GSM represents grams per square meter (paper weight)
- Higher GSM = thicker/heavier paper
- Selection affects cost calculations
- Thickness parameter usually set to "0" for default

---

### API 4: Get Mill Options

**Purpose**: Fetches available paper mill/manufacturer options.

**Trigger**: When user selects GSM.

**Method**: `GET`

**Endpoint**: `/api/planwindow/mill/{contentType}/{quality}/{gsm}/{thickness}`

**Example**: `/api/planwindow/mill/ReverseTuckIn/ALPHA%20GREY%20BACK/215/0`

**Headers**: Common headers (see above)

**URL Parameters**:
- `contentType`: Content type (e.g., "ReverseTuckIn")
- `quality`: Quality name (URL encoded)
- `gsm`: GSM value (e.g., "215")
- `thickness`: Thickness value (default: "0")

**Response** (200):
```json
[
  {
    "Mill": "ITC",
    "MillID": 1
  },
  {
    "Mill": "JK Paper",
    "MillID": 2
  },
  {
    "Mill": "West Coast",
    "MillID": 3
  }
]
```

**Common Mills**:
- ITC
- JK Paper
- West Coast
- Tamil Nadu Newsprint
- Orient Paper

**Usage Notes**:
- Mill selection is optional in most cases
- Different mills may have different prices
- Empty string "" is acceptable if not specified

---

### API 5: Get Finish Options

**Purpose**: Fetches available paper finish options.

**Trigger**: When user selects mill (or GSM if mill is optional).

**Method**: `GET`

**Endpoint**: `/api/planwindow/finish/{quality}/{gsm}/{mill}`

**Example**: `/api/planwindow/finish/ALPHA%20GREY%20BACK/215/ITC`

**Headers**: Common headers (see above)

**URL Parameters**:
- `quality`: Quality name (URL encoded)
- `gsm`: GSM value (e.g., "215")
- `mill`: Mill name (URL encoded, can be empty "")

**Response** (200):
```json
[
  {
    "Finish": "Matte",
    "FinishID": 1
  },
  {
    "Finish": "Glossy",
    "FinishID": 2
  },
  {
    "Finish": "Uncoated",
    "FinishID": 3
  }
]
```

**Common Finishes**:
- Matte
- Glossy
- Uncoated
- Silk

**Usage Notes**:
- Finish selection is optional
- Affects final appearance and cost
- Empty string "" is acceptable if not specified

---

### Dropdown API Call Sequence

```
1. Load Form → GetCategoryAllocatedContents/0
   ↓ User selects Content Type

2. Fetch Qualities → /quality/{contentType}
   ↓ User selects Quality

3. Fetch GSM → /gsm/{contentType}/{quality}/0
   ↓ User selects GSM

4. Fetch Mill → /mill/{contentType}/{quality}/{gsm}/0
   ↓ User selects Mill (optional)

5. Fetch Finish → /finish/{quality}/{gsm}/{mill}
   ↓ User selects Finish (optional)
```

**Cascading Dependencies**:
- Quality depends on Content Type
- GSM depends on Content Type + Quality
- Mill depends on Content Type + Quality + GSM
- Finish depends on Quality + GSM + Mill

---

## Main Workflow APIs

## 1. SaveMultipleEnquiry API

**Purpose**: Creates an enquiry record in the system. Called only once per session.

**Trigger**: When user clicks "Get Plans" button (Step 5 - Processes)

**Optimization**: Checks if enquiry already exists before calling. Reuses stored EnquiryID.

### Request

**Method**: `POST`

**Endpoint**: `/api/parksons/SaveMultipleEnquiry`

**Headers**: Common headers (see above)

**Body**:
```json
{
  "clientName": "Divyansh Enterprises",
  "clientId": 0,
  "jobName": "Sample Job",
  "quantity": "5000",
  "cartonType": "Reverse Tuck In",
  "dimensions": {
    "length": "100",
    "width": "50",
    "height": "150",
    "openFlap": "20",
    "pastingFlap": "20"
  },
  "paperDetails": {
    "quality": "ALPHA GREY BACK",
    "qualityId": "123",
    "gsm": "215",
    "mill": "",
    "finish": "",
    "purchaseRate": "",
    "landedRate": "",
    "chargeRate": "",
    "frontColor": "4",
    "backColor": "0",
    "specialFrontColor": "0",
    "specialBackColor": "0"
  },
  "processes": [
    {
      "operID": "53",
      "processName": "Lamination Matte Both Side"
    },
    {
      "operID": "92",
      "processName": "Aqueous Varnish Gloss"
    }
  ],
  "productCode": "",
  "salesEmployeeId": 0,
  "categoryId": 0,
  "categoryName": "",
  "fileName": "",
  "remark": ""
}
```

### Response

**Success** (200):
```json
10326
```

**Response Type**: `number` - Returns the EnquiryID directly as a number.

**Error Handling**:
- If API fails, error message is shown to user
- User can retry by clicking "Get Plans" again

### Usage Notes
- EnquiryID is stored in component state and localStorage
- On subsequent "Get Plans" clicks, this API is skipped
- Console shows: "✅ ENQUIRY ALREADY EXISTS - SKIPPING API CALL"

---

## 2. ShirinJob (PostShirinJob) API

**Purpose**: Generates multiple plan options based on specifications. Returns different machine configurations and costs.

**Trigger**: When user clicks "Get Plans" button (Step 5 - Processes)

**Note**: This API is called **every time** user clicks "Get Plans", even if enquiry exists.

### Request

**Method**: `POST`

**Endpoint**: `/api/parksons/ShirinJob` or `/api/planwindow/Shirin_Job`

**Headers**: Common headers (see above)

**Body** (Key Fields):
```json
{
  "SizeHeight": 150,
  "SizeLength": 100,
  "SizeWidth": 50,
  "SizeOpenflap": 20,
  "SizePastingflap": 20,
  "SizeBottomflap": 0,

  "JobNoOfPages": 0,
  "JobUps": 0,
  "JobPrePlan": "H:150,L:100,W:50,OF:20,PF:20",

  "PlanContentType": "ReverseTuckIn",
  "PlanFColor": 4,
  "PlanBColor": 0,
  "PlanSpeFColor": 0,
  "PlanSpeBColor": 0,
  "PlanColorStrip": 0,
  "PlanGripper": 0,
  "PlanPrintingStyle": "Choose Best",
  "PlanWastageValue": 0,
  "PlanPrintingGrain": "Both",
  "PlanPlateType": "CTP Plate",
  "PlanWastageType": "Machine Default",
  "PlanContQty": 5000,
  "PlanContName": "ReverseTuckIn",
  "PlanContDomainType": "Offset",

  "ItemPlanQuality": "ALPHA GREY BACK",
  "ItemPlanGsm": 215,
  "ItemPlanMill": "",
  "ItemPlanFinish": "",
  "ItemPlanThickness": 0,

  "OperId": "53,92",

  "Trimmingleft": 0,
  "Trimmingright": 0,
  "Trimmingtop": 0,
  "Trimmingbottom": 0,
  "Stripingleft": 0,
  "Stripingright": 0,
  "Stripingtop": 0,
  "Stripingbottom": 0,

  "MachineId": "",
  "CategoryID": 2,
  "LedgerID": 4,
  "EstimationQuantityUnit": "PCS",
  "JobSizeInputUnit": "MM",

  "ChkPlanInSpecialSizePaper": false,
  "ChkPlanInStandardSizePaper": false,
  "ChkPlanInAvailableStock": false,
  "ChkPaperByClient": false,
  "ChkBackToBackPastingRequired": false,

  "PlanMakeReadyWastage": 0,
  "JobAcrossUps": 0,
  "JobAroundUps": 0,
  "SizeBottomflapPer": 0,
  "SizeZipperLength": 0,
  "ZipperWeightPerMeter": 0,

  "BookSpine": 0,
  "BookHinge": 0,
  "BookCoverTurnIn": 0,
  "BookExtension": 0,
  "BookLoops": 0,

  "PlanOtherMaterialGSM": 0,
  "PlanOtherMaterialGSMSettingJSON": "",
  "MaterialWetGSMConfigJSON": "",
  "PlanPunchingType": null,

  "Planlabeltype": null,
  "Planwindingdirection": 0,
  "Planfinishedformat": null,
  "Plandietype": "",
  "PlanPcsPerRoll": 0,
  "PlanCoreInnerDia": 0,
  "PlanCoreOuterDia": 0,

  "ShowPlanUptoWastePercent": 30
}
```

### Response

**Success** (200):
```json
[
  {
    "PlanID": 12345,
    "MachineName": "KOMORI LS540",
    "SheetSize": "28x40",
    "Ups": 12,
    "TotalQuantity": 5000,
    "WastagePercent": 5.2,
    "PaperKgs": 234.5,
    "UnitCost": 2.45,
    "TotalCost": 12250.00,
    "ProductCode": "PKG001",
    "LedgerID": 4,
    "SalesEmployeeID": 52,
    "Remark": "",
    ...
  },
  {
    "PlanID": 12346,
    "MachineName": "HEIDELBERG SM74",
    ...
  }
]
```

**Response Type**: Array of plan objects

### Usage Notes
- Returns multiple plan options sorted by cost or efficiency
- User selects one plan from the results
- Plans are displayed as cards on "Best Plans" step (Step 6)

---

## 3. DirectCosting API

**Purpose**: Creates a booking/quotation and returns BookingID (used as Quotation Number).

**Trigger**: When user clicks "Create Quotation" button (Step 6 - Best Plans)

**Optimization**: Checks if quotation already exists before calling. Skips if quotationNumber and quotationData exist.

### Request

**Method**: `POST`

**Endpoint**: `/api/parksons/directcosting`

**Headers**: Common headers (see above)

**Body**:
```json
{
  "CostignParams": {
    "SizeHeight": 150,
    "SizeLength": 100,
    "SizeWidth": 50,
    "SizeOpenflap": 20,
    "SizePastingflap": 20,
    "SizeBottomflap": 0,

    "JobNoOfPages": 0,
    "JobUps": 0,
    "JobFlapHeight": 0,
    "JobTongHeight": 0,
    "JobFoldedH": 0,
    "JobFoldedL": 0,

    "PlanContentType": "ReverseTuckIn",
    "PlanFColor": 4,
    "PlanBColor": 0,
    "PlanSpeFColor": 0,
    "PlanSpeBColor": 0,
    "PlanColorStrip": 0,
    "PlanGripper": 0,
    "PlanPrintingStyle": "Single Side",
    "PlanWastageValue": 0,
    "PlanPrintingGrain": "Both",
    "PlanPlateType": "CTP Plate",
    "PlanWastageType": "Machine Default",
    "PlanContQty": 5000,
    "PlanContName": "ReverseTuckIn",
    "PlanContDomainType": "Offset",

    "ItemPlanQuality": "ALPHA GREY BACK",
    "ItemPlanGsm": 215,
    "ItemPlanMill": "",
    "ItemPlanFinish": "",
    "ItemPlanThickness": 0,

    "OperId": "53,92",

    "Trimmingleft": 0,
    "Trimmingright": 0,
    "Trimmingtop": 0,
    "Trimmingbottom": 0,
    "Stripingleft": 0,
    "Stripingright": 0,
    "Stripingtop": 0,
    "Stripingbottom": 0,

    "JobBottomPerc": 0,
    "JobPrePlan": "H:150,L:100,W:50,OF:20,PF:20",

    "ChkPlanInSpecialSizePaper": false,
    "ChkPlanInStandardSizePaper": false,
    "ChkPlanInAvailableStock": false,
    "ChkPaperByClient": false,
    "ChkBackToBackPastingRequired": false,

    "MachineId": "",
    "PlanOnlineCoating": "",

    "PaperTrimleft": 0,
    "PaperTrimright": 0,
    "PaperTrimtop": 0,
    "PaperTrimbottom": 0,

    "JobFoldInL": 1,
    "JobFoldInH": 1,

    "PlanPlateBearer": 0,
    "PlanStandardARGap": 0,
    "PlanStandardACGap": 0,

    "Planlabeltype": null,
    "Planwindingdirection": 0,
    "Planfinishedformat": null,
    "Plandietype": "",
    "PlanPcsPerRoll": 0,
    "PlanCoreInnerDia": 0,
    "PlanCoreOuterDia": 0,

    "EstimationQuantityUnit": "PCS",
    "JobSizeInputUnit": "MM",
    "CategoryID": 2,
    "LedgerID": 0,

    "SizeCenterSeal": 0,
    "SizeSideSeal": 0,
    "SizeTopSeal": 0,
    "SizeBottomGusset": 0,

    "PlanMakeReadyWastage": 0,

    "BookSpine": 0,
    "BookHinge": 0,
    "BookCoverTurnIn": 0,
    "BookExtension": 0,
    "BookLoops": 0,

    "PlanOtherMaterialGSM": 0,
    "PlanOtherMaterialGSMSettingJSON": "",
    "MaterialWetGSMConfigJSON": "",
    "PlanPunchingType": null,

    "JobAcrossUps": 0,
    "JobAroundUps": 0,
    "SizeBottomflapPer": 0,
    "SizeZipperLength": 0,
    "ZipperWeightPerMeter": 0
  },
  "EnquiryData": {
    "ProductCode": "",
    "LedgerID": 4,
    "EnquiryID": 10326,
    "SalesEmployeeID": 52,
    "CategoryID": 2,
    "Quantity": 5000,
    "ConcernPersonID": null,
    "JobName": "Sample Job",
    "ClientName": "Divyansh Enterprises",
    "FileName": "",
    "EnquiryDate": "13 Nov 2025",
    "EstimationUnit": "PCS",
    "ExpectCompletion": "10",
    "Remark": "",
    "TypeOfJob": null,
    "TypeOfPrinting": null,
    "EnquiryType": "Bid",
    "SalesType": "Export"
  }
}
```

### Response

**Success** (200):
```json
166
```

**Response Type**: `number` or `string` - Returns the BookingID/QuotationID directly.

**Error Handling**:
- If EnquiryID is 0 or missing, API returns 500 error
- Console shows validation warnings if EnquiryID is missing

### Usage Notes
- EnquiryID must be valid (from SaveMultipleEnquiry)
- BookingID returned is used as Quotation Number
- On subsequent calls (going back), this API is skipped

---

## 4. GetQuotationDetail API

**Purpose**: Retrieves complete quotation details including all costs, materials, processes, and billing information.

**Trigger**: Immediately after DirectCosting API succeeds (Step 6)

**Optimization**: Skipped if quotation already exists (same as DirectCosting).

### Request

**Method**: `GET`

**Endpoint**: `/api/planwindow/getquotationDetail/{quotationNumber}`

**Example**: `/api/planwindow/getquotationDetail/166`

**Headers**: Common headers (see above)

**Body**: None (GET request)

### Response

**Success** (200):
```json
{
  "BookingNo": 166,
  "Job_Date": "13-Nov-2025",
  "EnquiryDate": "13 Nov 2025",
  "LedgerName": "Divyansh Enterprises",
  "JobName": "Sample Job",
  "CompanyName": "Parksons",
  "ProductCode": "PKG001",
  "Quantity": 5000,

  "Size": {
    "Height": 150,
    "Length": 100,
    "Width": 50,
    "OpenFlap": 20,
    "PastingFlap": 20
  },

  "CartonType": "Reverse Tuck In",

  "Paper": {
    "Quality": "ALPHA GREY BACK",
    "GSM": 215,
    "Mill": "",
    "Finish": "",
    "FrontColor": 4,
    "BackColor": 0
  },

  "Printing": {
    "MachineName": "KOMORI LS540",
    "SheetSize": "28x40",
    "Ups": 12,
    "PrintingStyle": "Single Side"
  },

  "Processes": [
    {
      "ProcessName": "Lamination Matte Both Side",
      "Rate": 1500.00,
      "Amount": 7500.00
    },
    {
      "ProcessName": "Aqueous Varnish Gloss",
      "Rate": 800.00,
      "Amount": 4000.00
    }
  ],

  "Costs": {
    "PaperCost": 5234.50,
    "PrintingCost": 3456.00,
    "ProcessCost": 11500.00,
    "DieCost": 2000.00,
    "OtherCost": 500.00,
    "TotalCost": 22690.50,
    "UnitCost": 4.54
  },

  "SalesEmployeeID": 52,
  "CategoryID": 2,
  "Remark": "",
  "Status": "Draft"
}
```

**Response Type**: Object with complete quotation details

### Usage Notes
- Used to display final quotation on Step 7
- Contains all information needed for PDF generation
- Includes breakdown of all costs and materials

---

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "error": "Invalid authentication credentials"
}
```
**Solution**: Check Authorization header and credentials

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```
**Common Causes**:
- Invalid EnquiryID (0 or null) in DirectCosting
- Missing required fields in request body
- Invalid data types

**Network Errors**:
- Timeout: Default 2 minutes
- Connection refused: Check API base URL
- CORS errors: Should be handled by API server

---

## Data Persistence

### LocalStorage Keys

1. **`printingWizard.jobData.v1`**
   - Stores: All form data (jobData)
   - Cleared: After successful quotation creation

2. **`printingWizard.enquiryNumber`**
   - Stores: EnquiryID from SaveMultipleEnquiry
   - Cleared: After successful quotation creation or "Clear Store" button

### State Management

**Component State Variables**:
- `enquiryNumber`: EnquiryID from SaveMultipleEnquiry
- `planningResults`: Plans from ShirinJob API
- `quotationNumber`: BookingID from DirectCosting
- `quotationData`: Full details from GetQuotationDetail
- `jobData`: All form fields

**Clearing Logic**:
- After quotation created: All state and localStorage cleared
- "Clear Store" button: Manual reset of all data
- Page refresh: Reloads from localStorage (if available)

---

## API Call Optimization

### Duplicate Prevention

**SaveMultipleEnquiry**:
- ✅ Called once per session
- ✅ Skipped if enquiryNumber exists
- ✅ Stored in state and localStorage

**ShirinJob**:
- ✅ Called every time (allows plan regeneration)
- ✅ Can be called with same EnquiryID

**DirectCosting + GetQuotationDetail**:
- ✅ Called once per quotation
- ✅ Skipped if quotationNumber and quotationData exist
- ✅ Allows user to go back without duplicate quotations

### Console Logging

All APIs include comprehensive console logging:
- 📤 Request body
- 📥 Response data
- ✅ Success indicators
- ❌ Error messages
- 🔑 Key field extractions

---

## Testing

### Test Credentials

**API Authentication**:
- Username: `parksonsnew`
- Password: `parksonsnew`

**Test Users** (Frontend Login):
- `rajesh@parksons.com` / `rajesh@123`
- `amit@parksons.com` / `amit@123`

### Test Scenarios

1. **Complete Flow**:
   - Fill form → Get Plans → Create Quotation → View Details

2. **Go Back Scenarios**:
   - Get Plans → Go back to Step 5 → Get Plans again (should skip SaveMultipleEnquiry)
   - Create Quotation → Go back to Step 6 → Create Quotation again (should skip both APIs)

3. **Error Scenarios**:
   - Invalid EnquiryID (test with 0)
   - Missing required fields
   - Network timeout

---

## Environment Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.indusanalytics.co.in
NEXT_PUBLIC_API_USERNAME=parksonsnew
NEXT_PUBLIC_API_PASSWORD=parksonsnew
NEXT_PUBLIC_COMPANY_ID=2
NEXT_PUBLIC_USER_ID=2
NEXT_PUBLIC_FYEAR=2025-2026
NEXT_PUBLIC_PRODUCTION_UNIT_ID=1
```

### Configuration File

Location: `lib/api-config.ts`

Key Functions:
- `getAuthHeader()`: Generates Basic Auth
- `getDefaultHeaders()`: Returns all common headers
- `apiClient.get()`: GET request wrapper
- `apiClient.post()`: POST request wrapper
- `saveMultipleEnquiry()`: SaveMultipleEnquiry API call
- `postShirinJob()`: ShirinJob API call
- `createBooking()`: DirectCosting API call
- `getQuotationDetail()`: GetQuotationDetail API call

---

## API Response Parsing

### Double-Encoded JSON

Some APIs return double-encoded JSON strings. The `apiClient` handles this automatically:

```javascript
// API returns: "\"10326\""
// Parser unwraps to: 10326
```

The parser attempts up to 10 levels of unwrapping to handle heavily escaped responses.

---

## Rate Limiting & Performance

**No explicit rate limiting** configured, but best practices:
- Wait for API response before making next call
- Show loading states to prevent duplicate clicks
- Cache responses where appropriate (EnquiryID, QuotationData)

**Average Response Times**:
- SaveMultipleEnquiry: ~500ms
- ShirinJob: ~2-3s (generates multiple plans)
- DirectCosting: ~1-2s
- GetQuotationDetail: ~500ms

---

## Support & Troubleshooting

### Common Issues

1. **"Invalid EnquiryID" error**:
   - Ensure SaveMultipleEnquiry was called first
   - Check EnquiryID is not 0 or null
   - Verify localStorage has `printingWizard.enquiryNumber`

2. **"Quotation not created" error**:
   - Verify all required fields in DirectCosting body
   - Check EnquiryID is valid
   - Ensure headers include CompanyID and UserID

3. **Plans not showing**:
   - Verify ShirinJob API succeeded
   - Check console for response data
   - Ensure OperId is valid comma-separated list

### Debug Mode

Enable detailed logging in browser console (F12):
- All API requests show full body
- All responses show complete data
- State changes are logged
- Error details are displayed

---

**Document Version**: 1.0
**Last Updated**: 13 Nov 2025
**Maintained By**: Development Team
