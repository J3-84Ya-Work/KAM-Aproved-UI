// Run this script with: node generate-mock-data.js
// This will generate all the remaining mock data files

const fs = require('fs');

// Helper functions
const getRandomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data arrays
const companies = [
  "Hindustan Unilever", "ITC Limited", "Britannia Industries", "Parle Products", "Nestle India",
  "Sun Pharma", "Dr Reddy's Labs", "Cipla Pharmaceuticals", "Dabur India", "Patanjali Ayurved",
  "Tata Motors", "Maruti Suzuki", "Mahindra & Mahindra", "Hero MotoCorp", "Bajaj Auto", "TVS Motor",
  "TCS", "Infosys Ltd", "Wipro Technologies", "HCL Technologies", "Tech Mahindra",
  "Reliance Retail", "Future Retail", "DMart", "Spencer's Retail", "Big Bazaar",
  "Amazon India", "Flipkart", "Myntra Fashion", "Swiggy", "Zomato", "BigBasket",
  "Samsung India", "LG Electronics", "Sony India", "Panasonic India", "Whirlpool India", "Bosch India",
  "Tata Steel", "JSW Steel", "Larsen & Toubro", "ABB India", "Siemens India", "Schneider Electric",
  "MRF Tyres", "Apollo Tyres", "Ceat Tyres", "JK Tyre", "Bridgestone India",
  "Asian Paints Ltd", "Berger Paints", "Pidilite Industries", "Ultratech Cement", "ACC Cement",
  "Havells India", "Crompton Greaves", "V-Guard Industries", "Anchor Electricals", "Legrand India",
  "Prestige Smart Kitchen", "TTK Prestige", "Pigeon India", "Milton India", "Butterfly Gandhimathi",
  "Nike India", "Adidas India", "Puma India", "Reebok India", "Decathlon India",
  "Coca-Cola India", "PepsiCo India", "Bisleri", "Red Bull India", "Tropicana India",
  "Amul", "Mother Dairy", "Kwality Walls", "Vadilal Industries", "Cream Bell",
  "Godrej Industries", "Aditya Birla Group", "Vedanta Limited", "Hindalco Industries",
  "Voltas Limited", "Blue Star", "Carrier Midea India", "Daikin India", "Hitachi India",
  "Otis Elevator", "Kone India", "Schindler India", "ThyssenKrupp Elevators",
  "Cummins India", "Kirloskar Electric", "BHEL India", "GE India", "Honeywell India",
  "SKF India", "Timken India", "NSK India", "NTN Bearing", "FAG Bearings",
  "Continental India", "Gates India", "Fenner India", "Optibelt India", "Megadyne India"
];

const jobTypes = [
  "Packaging Boxes", "Printed Labels", "Corrugated Sheets", "Folding Cartons", "Die-Cut Boxes",
  "Pharmaceutical Cartons", "Food Grade Packaging", "Industrial Labels", "Auto Parts Packaging",
  "E-commerce Shipping Boxes", "Delivery Cartons", "Luxury Gift Boxes", "Tea/Coffee Packaging",
  "Beverage Cartons", "Snack Packaging", "Electronic Device Boxes", "Appliance Cartons",
  "Medicine Cartons", "Cosmetic Packaging", "Retail Display Boxes", "Shipping Containers"
];

const locations = ["Mumbai", "Navi Mumbai", "Pune", "Delhi", "Gurugram", "Noida", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Ahmedabad", "Jaipur"];
const plants = ["Plant A", "Plant B", "Plant C", "Plant D"];
const prepress = ["Prepress Hub 1", "Prepress Hub 2", "Prepress Hub 3"];

// Generate Clients Data (150+ entries)
const generateClients = () => {
  const clients = [];
  const statuses = ["Active", "Active", "Active", "Pending Setup", "Inactive"];
  const complianceStatuses = ["Complete", "Complete", "Complete", "Pending", "Incomplete"];

  for (let i = 1; i <= 150; i++) {
    const company = getRandomElement(companies);
    const hasCode = Math.random() > 0.1;
    const status = getRandomElement(statuses);
    const complianceStatus = getRandomElement(complianceStatuses);
    const isActive = status === "Active";

    clients.push({
      id: `CUST-${String(i).padStart(3, '0')}`,
      name: company,
      code: hasCode ? `${company.substring(0, 3).toUpperCase()}-2024` : null,
      email: `contact@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+91 ${getRandomNumber(90000, 99999)} ${getRandomNumber(10000, 99999)}`,
      gst: `${getRandomNumber(10, 37)}${String.fromCharCode(65 + getRandomNumber(0, 25))}${String.fromCharCode(65 + getRandomNumber(0, 25))}BC${getRandomNumber(1000, 9999)}${String.fromCharCode(65 + getRandomNumber(0, 25))}1Z${String.fromCharCode(65 + getRandomNumber(0, 25))}`,
      pan: `${String.fromCharCode(65 + getRandomNumber(0, 25))}${String.fromCharCode(65 + getRandomNumber(0, 25))}BC${getRandomNumber(1000, 9999)}${String.fromCharCode(65 + getRandomNumber(0, 25))}`,
      status: status,
      complianceStatus: complianceStatus,
      totalOrders: isActive ? getRandomNumber(5, 100) : 0,
      totalValue: isActive ? getRandomNumber(500000, 50000000) : 0,
      lastOrder: isActive ? getRandomDate(new Date(2023, 6, 1), new Date(2024, 0, 15)) : null,
      documents: {
        gst: complianceStatus !== "Incomplete",
        pan: complianceStatus !== "Incomplete",
        agreement: complianceStatus === "Complete",
      },
    });
  }

  return clients;
};

// Generate SDO Projects (150+ entries)
const generateSDO = () => {
  const projects = [];
  const statuses = ["Sample Approved", "Sales Approval", "Clarification", "In PDD"];

  for (let i = 1; i <= 150; i++) {
    const status = getRandomElement(statuses);
    const createdDate = getRandomDate(new Date(2023, 3, 1), new Date(2024, 0, 15));
    const approved = status === "Sample Approved";

    projects.push({
      id: `SDO-2024-${String(i).padStart(3, '0')}`,
      customer: getRandomElement(companies),
      job: getRandomElement(jobTypes),
      quoteId: `QUO-2024-${String(getRandomNumber(1, 150)).padStart(3, '0')}`,
      executionLocation: getRandomElement(locations),
      productionPlant: getRandomElement(plants),
      status: status,
      progress: status === "Sample Approved" ? 100 : getRandomNumber(40, 90),
      createdDate: createdDate,
      approvedDate: approved ? getRandomDate(new Date(createdDate), new Date(2024, 0, 20)) : null,
      notes: `${status} - ${getRandomElement(jobTypes)} project`,
      history: [
        { stage: "Inquiry Received", date: getRandomDate(new Date(2023, 2, 1), new Date(createdDate)) },
        { stage: "Sample Initiated", date: createdDate },
        ...(approved ? [{ stage: "Sample Approved", date: getRandomDate(new Date(createdDate), new Date(2024, 0, 20)) }] : [])
      ],
    });
  }

  return projects;
};

// Generate JDO Projects (150+ entries)
const generateJDO = () => {
  const projects = [];
  const artworkStatuses = ["Approved", "In Review", "Pending", "Clarification"];
  const bomStatuses = ["Complete", "Pending", "Clarification"];

  for (let i = 1; i <= 150; i++) {
    const artworkStatus = getRandomElement(artworkStatuses);
    const bomStatus = getRandomElement(bomStatuses);
    const routingStatus = getRandomElement(bomStatuses);
    const allComplete = artworkStatus === "Approved" && bomStatus === "Complete" && routingStatus === "Complete";

    projects.push({
      id: `JDO-2024-${String(i).padStart(3, '0')}`,
      customer: getRandomElement(companies),
      job: getRandomElement(jobTypes),
      sdoId: `SDO-2024-${String(getRandomNumber(1, 150)).padStart(3, '0')}`,
      prePressPlant: getRandomElement(prepress),
      productionPlant: getRandomElement(plants),
      artworkStatus: artworkStatus,
      bomStatus: bomStatus,
      routingStatus: routingStatus,
      progress: allComplete ? 100 : getRandomNumber(30, 90),
      createdDate: getRandomDate(new Date(2023, 4, 1), new Date(2024, 0, 15)),
      notes: allComplete ? "Ready for commercial PO" : `${artworkStatus} artwork, ${bomStatus} BOM`,
      mfReleased: allComplete || Math.random() > 0.5,
    });
  }

  return projects;
};

// Generate Commercial Orders (150+ entries)
const generateCommercial = () => {
  const orders = [];
  const statuses = ["In PDD", "Approved", "In Review"];
  const stageStatuses = ["Complete", "In Progress", "Approved", "Pending", "In PDD", "Released", "Scheduled"];

  for (let i = 1; i <= 150; i++) {
    const status = getRandomElement(statuses);
    const orderDate = getRandomDate(new Date(2023, 5, 1), new Date(2024, 0, 10));

    orders.push({
      id: `COM-2024-${String(i).padStart(3, '0')}`,
      customer: getRandomElement(companies),
      job: getRandomElement(jobTypes),
      jdoId: `JDO-2024-${String(getRandomNumber(1, 150)).padStart(3, '0')}`,
      prePressPlant: getRandomElement(prepress),
      productionPlant: getRandomElement(plants),
      prePressStatus: getRandomElement(stageStatuses),
      productionStatus: getRandomElement(stageStatuses),
      dispatchStatus: getRandomElement(["Pending", "Scheduled", "Dispatched"]),
      amount: getRandomNumber(50000, 5000000),
      quantity: `${getRandomNumber(1000, 50000)} units`,
      status: status,
      orderDate: orderDate,
      expectedDelivery: getRandomDate(new Date(orderDate), new Date(2024, 1, 28)),
      progress: status === "Approved" ? 100 : getRandomNumber(40, 95),
      notes: `${status} - Commercial production ${status === "Approved" ? "completed" : "ongoing"}`,
    });
  }

  return orders;
};

// Generate PN Orders (150+ entries)
const generatePN = () => {
  const orders = [];
  const statuses = ["Arrived", "Not Arrived"];
  const rmTypes = ["Paperboard", "Coated Board", "Vinyl", "Corrugated", "Kraft Paper", "Art Paper"];

  for (let i = 1; i <= 150; i++) {
    const status = getRandomElement(statuses);
    const initiateDate = getRandomDate(new Date(2023, 6, 1), new Date(2024, 0, 10));
    const punchedDate = getRandomDate(new Date(initiateDate), new Date(2024, 0, 15));
    const arrived = status === "Arrived";

    orders.push({
      id: `PN-2024-${String(i).padStart(3, '0')}`,
      pnReqNo: `REQ-2024-${String(getRandomNumber(1000, 9999))}`,
      customer: getRandomElement(companies),
      job: getRandomElement(jobTypes),
      commercialId: `COM-2024-${String(getRandomNumber(1, 150)).padStart(3, '0')}`,
      fgMaterial: `FG-${String.fromCharCode(65 + getRandomNumber(0, 25))}${String.fromCharCode(65 + getRandomNumber(0, 25))}-${getRandomNumber(1000, 9999)}`,
      amount: getRandomNumber(100000, 5000000),
      quantity: `${getRandomNumber(1000, 50000)} units`,
      status: status,
      prePressStatus: arrived ? "Complete" : getRandomElement(["Complete", "Approved", "In Review"]),
      productionStatus: arrived ? "Completed" : getRandomElement(["In PDD", "Released", "Pending"]),
      dispatchStatus: arrived ? "Dispatched" : "Pending",
      punchedDate: punchedDate,
      releasedDate: arrived || Math.random() > 0.3 ? getRandomDate(new Date(punchedDate), new Date(2024, 0, 18)) : null,
      dispatchedDate: arrived ? getRandomDate(new Date(2024, 0, 12), new Date(2024, 0, 20)) : null,
      initiateDate: initiateDate,
      progress: arrived ? 100 : getRandomNumber(30, 90),
      notes: arrived ? "Successfully delivered to customer" : `Production ${status === "Not Arrived" ? "in progress" : "pending"}`,
      description: `${getRandomElement(jobTypes)} - ${getRandomElement(rmTypes)}`,
      rmType: getRandomElement(rmTypes),
      procurementQty: `${getRandomNumber(1000, 50000).toLocaleString()} units`,
      plant: getRandomElement(plants),
      orderDate: getRandomDate(new Date(2023, 6, 1), new Date(initiateDate)),
      expectedDelivery: getRandomDate(new Date(2024, 0, 15), new Date(2024, 1, 28)),
    });
  }

  return orders;
};

// Write files
console.log('Generating mock data...');

const clientsData = generateClients();
const sdoData = generateSDO();
const jdoData = generateJDO();
const commercialData = generateCommercial();
const pnData = generatePN();

// Write Clients
fs.writeFileSync('./components/clients-content-data.tsx',
  `// Replace const clients = [...] in clients-content.tsx with this data\n\nexport const clientsData = ${JSON.stringify(clientsData, null, 2)}\n`
);

// Write SDO Projects
fs.writeFileSync('./components/sdo-projects-data.tsx',
  `// Replace const sdoProjects = [...] in projects-content.tsx with this data\n\nexport const sdoProjectsData = ${JSON.stringify(sdoData, null, 2)}\n`
);

// Write JDO Projects
fs.writeFileSync('./components/jdo-projects-data.tsx',
  `// Replace const jdoProjects = [...] in projects-content.tsx with this data\n\nexport const jdoProjectsData = ${JSON.stringify(jdoData, null, 2)}\n`
);

// Write Commercial Orders
fs.writeFileSync('./components/commercial-orders-data.tsx',
  `// Replace const commercialOrders = [...] in projects-content.tsx with this data\n\nexport const commercialOrdersData = ${JSON.stringify(commercialData, null, 2)}\n`
);

// Write PN Orders
fs.writeFileSync('./components/pn-orders-data.tsx',
  `// Replace const pnOrders = [...] in projects-content.tsx with this data\n\nexport const pnOrdersData = ${JSON.stringify(pnData, null, 2)}\n`
);

console.log('✅ Generated files:');
console.log('  - components/clients-content-data.tsx (150 entries)');
console.log('  - components/sdo-projects-data.tsx (150 entries)');
console.log('  - components/jdo-projects-data.tsx (150 entries)');
console.log('  - components/commercial-orders-data.tsx (150 entries)');
console.log('  - components/pn-orders-data.tsx (150 entries)');
console.log('\\nTotal: 750+ new entries generated!');
console.log('\\nNext steps:');
console.log('1. Run: node generate-mock-data.js');
console.log('2. Import and use the generated data in each respective component');
