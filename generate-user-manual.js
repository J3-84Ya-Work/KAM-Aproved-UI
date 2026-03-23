const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  PageBreak, Header, Footer, ImageRun, TableOfContents,
  PageNumber, NumberFormat, Tab, TabStopType, TabStopPosition,
  convertInchesToTwip, LevelFormat, UnderlineType,
} = require("docx");
const fs = require("fs");

// ── Brand Colors ──────────────────────────────────────────────────────
const BLUE = "005180";
const GREEN = "78BE20";
const RED = "B92221";
const DARK = "1F2937";
const GRAY = "6B7280";
const LIGHT_GRAY = "F3F4F6";
const WHITE = "FFFFFF";
const LIGHT_BLUE = "EFF6FF";

// ── Helper Functions ──────────────────────────────────────────────────

function heading1(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
    children: [
      new TextRun({ text, bold: true, size: 32, color: BLUE, font: "Calibri" }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, size: 26, color: BLUE, font: "Calibri" }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 22, color: DARK, font: "Calibri" }),
    ],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: opts.size || 20,
        color: opts.color || DARK,
        font: "Calibri",
        bold: opts.bold || false,
        italics: opts.italic || false,
      }),
    ],
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.spaceBefore || 80, after: opts.spaceAfter || 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: runs.map(r => new TextRun({
      text: r.text,
      size: r.size || 20,
      color: r.color || DARK,
      font: "Calibri",
      bold: r.bold || false,
      italics: r.italic || false,
    })),
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    bullet: { level },
    children: [
      new TextRun({ text, size: 20, color: DARK, font: "Calibri" }),
    ],
  });
}

function richBullet(runs, level = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    bullet: { level },
    children: runs.map(r => new TextRun({
      text: r.text,
      size: r.size || 20,
      color: r.color || DARK,
      font: "Calibri",
      bold: r.bold || false,
      italics: r.italic || false,
    })),
  });
}

function numberedItem(text, num) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      new TextRun({ text: `${num}. `, bold: true, size: 20, color: BLUE, font: "Calibri" }),
      new TextRun({ text, size: 20, color: DARK, font: "Calibri" }),
    ],
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
    children: [
      new TextRun({ text: "Note: ", bold: true, size: 20, color: BLUE, font: "Calibri" }),
      new TextRun({ text, size: 20, color: DARK, font: "Calibri" }),
    ],
  });
}

function makeTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    shading: { type: ShadingType.SOLID, color: BLUE },
    width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: "Calibri" })],
    })],
  }));

  const dataRows = rows.map((row, rowIdx) => {
    const bgColor = rowIdx % 2 === 0 ? WHITE : LIGHT_GRAY;
    return new TableRow({
      children: row.map(cell => new TableCell({
        shading: { type: ShadingType.SOLID, color: bgColor },
        width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: String(cell), size: 18, color: DARK, font: "Calibri" })],
        })],
      })),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

function spacer(size = 200) {
  return new Paragraph({ spacing: { before: size } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── Document Build ────────────────────────────────────────────────────

async function generate() {
  const children = [];

  // ════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ════════════════════════════════════════════════════════════════════
  children.push(spacer(1200));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "ParkBuddy", bold: true, size: 72, color: BLUE, font: "Calibri" })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: "User Manual", size: 40, color: GREEN, font: "Calibri" })],
  }));
  children.push(spacer(100));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, size: 3, color: BLUE },
      bottom: { style: BorderStyle.SINGLE, size: 3, color: BLUE },
    },
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "Version 2.0  |  March 2026", size: 24, color: GRAY, font: "Calibri" })],
  }));
  children.push(spacer(400));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "Prepared for: ", size: 22, color: GRAY, font: "Calibri" }),
      new TextRun({ text: "Parksons Packaging Ltd.", bold: true, size: 22, color: DARK, font: "Calibri" }),
    ],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "Prepared by: ", size: 22, color: GRAY, font: "Calibri" }),
      new TextRun({ text: "IndusAnalytics", bold: true, size: 22, color: DARK, font: "Calibri" }),
    ],
  }));
  children.push(spacer(600));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CONFIDENTIAL", bold: true, size: 20, color: RED, font: "Calibri" })],
  }));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // DOCUMENT CONTROL
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("Document Control"));
  children.push(makeTable(
    ["Item", "Detail"],
    [
      ["Document Title", "ParkBuddy -- User Manual"],
      ["Version", "2.0"],
      ["Status", "Released"],
      ["Date", "March 2026"],
      ["Author", "IndusAnalytics"],
      ["Client", "Parksons Packaging Ltd."],
      ["Application URL", "https://parkbuddy.ai"],
      ["Classification", "Confidential"],
    ]
  ));
  children.push(spacer());

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("Table of Contents"));
  children.push(spacer(100));
  const tocItems = [
    "1. Overview",
    "2. System Requirements",
    "3. Login and Authentication",
    "4. Navigation and Layout",
    "5. Home -- AI Costing Assistant",
    "6. Enquiries",
    "7. Quotations",
    "8. Projects",
    "9. Analytics Dashboard",
    "10. Customers",
    "11. Conversations",
    "12. Ask Rate",
    "13. Rate Queries",
    "14. Approvals",
    "15. Drafts",
    "16. Customer History",
    "17. Profile and Password Management",
    "18. Settings",
    "19. Notifications",
    "20. Email Notifications",
    "21. User Roles and Permissions",
    "22. Troubleshooting",
    "23. Support",
  ];
  tocItems.forEach(item => {
    children.push(new Paragraph({
      spacing: { before: 60, after: 60 },
      indent: { left: convertInchesToTwip(0.2) },
      children: [new TextRun({ text: item, size: 21, color: DARK, font: "Calibri" })],
    }));
  });

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 1. OVERVIEW
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("1. Overview"));
  children.push(para("ParkBuddy is an enterprise-grade Key Account Manager (KAM) platform developed by IndusAnalytics for Parksons Packaging Ltd. The application centralizes the complete sales and procurement workflow into a single, role-based interface accessible at https://parkbuddy.ai."));

  children.push(heading2("1.1 Core Capabilities"));
  children.push(makeTable(
    ["Capability", "Description"],
    [
      ["AI-Powered Costing", "Conversational chatbot that generates quotation costings from product specifications"],
      ["Enquiry Management", "Create, track, and manage customer enquiries with manual and dynamic form options"],
      ["Quotation Workflow", "Full quotation lifecycle with cost breakdowns, KPI analysis, and target price comparison"],
      ["Project Tracking", "Multi-type project management covering SDO, JDO, Commercial, and PN categories"],
      ["Customer Onboarding", "Multi-level approval workflow for new customer registration"],
      ["Rate Management", "Structured rate request and response workflow between KAM and Purchase teams"],
      ["Email Notifications", "Automated email alerts via Microsoft Graph API for rate requests, OTP verification, and escalations"],
      ["Role-Based Access", "Distinct interfaces and permissions for KAM, HOD, Vertical Head, and Purchase users"],
      ["Two-Factor Authentication", "OTP-based login verification sent to registered email address"],
      ["Responsive Design", "Full functionality across desktop, tablet, and mobile devices"],
    ]
  ));

  children.push(heading2("1.2 User Roles"));
  children.push(makeTable(
    ["Role", "Primary Function"],
    [
      ["KAM (Key Account Manager)", "Sales workflow -- enquiries, quotations, customer management, rate requests"],
      ["H.O.D (Head of Department)", "Approval authority -- reviews and approves quotations, customers, rates"],
      ["Vertical Head", "Senior approval authority -- final sign-off on critical items"],
      ["Purchase", "Procurement -- responds to rate queries, manages item pricing"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 2. SYSTEM REQUIREMENTS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("2. System Requirements"));

  children.push(heading2("2.1 Supported Browsers"));
  children.push(makeTable(
    ["Browser", "Minimum Version"],
    [
      ["Google Chrome", "90 or later"],
      ["Microsoft Edge", "90 or later"],
      ["Mozilla Firefox", "88 or later"],
      ["Apple Safari", "14 or later"],
    ]
  ));

  children.push(heading2("2.2 Device Requirements"));
  children.push(bullet("Stable internet connection"));
  children.push(bullet("Screen resolution: 360px minimum width (mobile), 1024px or higher recommended (desktop)"));
  children.push(bullet("JavaScript must be enabled in the browser"));

  children.push(heading2("2.3 Access"));
  children.push(richPara([
    { text: "URL: ", bold: true },
    { text: "https://parkbuddy.ai" },
  ]));
  children.push(para("Credentials are provisioned by the system administrator."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 3. LOGIN AND AUTHENTICATION
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("3. Login and Authentication"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/login" },
  ]));

  children.push(heading2("3.1 Standard Login"));
  children.push(numberedItem("Navigate to the login page.", 1));
  children.push(numberedItem("Enter your Username in the designated field.", 2));
  children.push(numberedItem("Enter your Password.", 3));
  children.push(numberedItem('Optionally enable "Remember me" to persist credentials across sessions.', 4));
  children.push(numberedItem('Click "Sign In".', 5));

  children.push(heading2("3.2 Two-Factor Authentication (OTP)"));
  children.push(para("If your account has two-factor authentication enabled and a registered email address on file:"));
  children.push(numberedItem("After entering valid credentials, the system transitions to the OTP verification screen.", 1));
  children.push(numberedItem("A six-digit verification code is sent to your registered email address (displayed in masked format, e.g., ab***@gmail.com).", 2));
  children.push(numberedItem("Enter the code in the six input fields. Each field automatically advances to the next upon entry.", 3));
  children.push(numberedItem("Alternatively, paste a copied code -- the system distributes digits across all fields automatically.", 4));
  children.push(numberedItem("The code auto-submits once all six digits are entered.", 5));
  children.push(numberedItem("A five-minute countdown timer displays the remaining validity period.", 6));
  children.push(numberedItem('If the code expires or is not received, click "Resend OTP" (available after a 60-second cooldown).', 7));
  children.push(numberedItem('Click "Back to Login" to return to the credentials screen.', 8));
  children.push(note("Accounts without a registered email address bypass OTP verification and proceed directly to the dashboard."));

  children.push(heading2("3.3 Post-Login Routing"));
  children.push(para("The system routes users to their designated landing page based on role:"));
  children.push(makeTable(
    ["Role", "Landing Page"],
    [
      ["KAM", "Home (AI Costing Assistant)"],
      ["H.O.D / Vertical Head", "Approvals"],
      ["Purchase", "Rate Queries"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 4. NAVIGATION AND LAYOUT
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("4. Navigation and Layout"));

  children.push(heading2("4.1 Desktop Layout"));
  children.push(richBullet([
    { text: "Left Sidebar", bold: true },
    { text: " -- Primary navigation panel listing all accessible modules. The sidebar is collapsible; click the collapse icon to toggle between full-label and icon-only modes. Each menu item displays a badge count indicating pending or active items." },
  ]));
  children.push(richBullet([
    { text: "Top Header", bold: true },
    { text: " -- Displays the current page title, a back-navigation button (where applicable), and contextual action buttons." },
  ]));

  children.push(heading2("4.2 Mobile Layout"));
  children.push(richBullet([
    { text: "Bottom Navigation Bar", bold: true },
    { text: " -- Provides quick access to five primary modules: Home, Enquiries, Quotations, Conversations, and More." },
  ]));
  children.push(richBullet([
    { text: '"More" Page', bold: true },
    { text: " -- A grid-based menu providing access to all remaining modules: Dashboard, Profile, Customers, Projects, Approvals, Settings, and Logout." },
  ]));

  children.push(heading2("4.3 Module Access by Role"));
  children.push(makeTable(
    ["Module", "KAM", "HOD / VH", "Purchase"],
    [
      ["Home (AI Chat)", "Yes", "--", "--"],
      ["Enquiries", "Yes", "--", "--"],
      ["Quotations", "Yes", "Yes", "--"],
      ["Projects", "Yes", "Yes", "--"],
      ["Analytics", "Yes", "Yes", "--"],
      ["Customers", "Yes", "Yes", "--"],
      ["Conversations", "Yes", "--", "--"],
      ["Ask Rate", "Yes", "--", "--"],
      ["Rate Queries", "--", "--", "Yes"],
      ["Approvals", "--", "Yes", "--"],
      ["Settings", "Yes", "Yes", "Yes"],
      ["Profile", "Yes", "Yes", "Yes"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 5. HOME -- AI COSTING ASSISTANT
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("5. Home -- AI Costing Assistant"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM" },
  ]));
  children.push(para("The Home page serves as the primary workspace for KAM users, providing an AI-powered conversational interface for generating quotation costings."));

  children.push(heading2("5.1 Welcome Screen"));
  children.push(bullet("A personalized greeting message is displayed upon loading."));
  children.push(bullet('A "Recent Chats" section lists previous conversations for quick resumption.'));
  children.push(bullet('Quick-start prompts (e.g., "I want costing") are available to initiate a new session.'));

  children.push(heading2("5.2 Starting a Costing Conversation"));
  children.push(numberedItem('Click "I want costing" or type a product-related query.', 1));
  children.push(numberedItem("The AI assistant (ParkBuddy) initiates a structured conversation, requesting product type, dimensions, material specifications, quantity, printing requirements, and finishing details.", 2));
  children.push(numberedItem("Based on collected inputs, ParkBuddy generates a Costing Summary card containing:", 3));
  children.push(bullet("Annual Quantity and Kgs per 1000 pcs", 1));
  children.push(bullet("KPI Indicators -- RMC%, PSR, PKR", 1));
  children.push(bullet("Detailed Cost Breakdown -- Material, Machine, Labour, Overheads", 1));
  children.push(bullet("Target Price Comparison", 1));
  children.push(bullet("Status and Recommended Next Steps", 1));
  children.push(numberedItem("Continue the conversation to refine parameters or request alternative scenarios.", 4));

  children.push(heading2("5.3 Resuming a Previous Conversation"));
  children.push(bullet('Click any entry under "Recent Chats" on the welcome screen.'));
  children.push(bullet("Alternatively, navigate to the Conversations module and select the desired chat."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 6. ENQUIRIES
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("6. Enquiries"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/inquiries    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM" },
  ]));

  children.push(heading2("6.1 Viewing Enquiries"));
  children.push(para("All enquiries are presented in a searchable, filterable data table with columns: Enquiry Number, Customer, Job Name, Quantity, Date, and Status."));

  children.push(heading2("6.2 Creating a New Enquiry"));
  children.push(para("Click the floating action button (+) at the bottom-right corner to access creation options:"));
  children.push(makeTable(
    ["Option", "Description"],
    [
      ["New Enquiry", "Opens the manual enquiry form"],
      ["Drafts", "Access previously saved draft enquiries"],
    ]
  ));

  children.push(heading2("6.3 Manual Enquiry Form"));
  children.push(heading3("Required Fields (indicated by red asterisk)"));
  children.push(bullet("Client Name"));
  children.push(bullet("Job Name"));
  children.push(bullet("Quantity"));
  children.push(bullet("Sales Person"));
  children.push(bullet("Plant"));
  children.push(bullet("Payment Terms"));

  children.push(heading3("Optional Fields"));
  children.push(bullet("Contact Person, Email, Mobile Number"));
  children.push(bullet("Enquiry Date, Reference Number, Supply Location"));
  children.push(bullet("Product Dimensions (Height, Length, Width)"));
  children.push(bullet("Board Type, GSM, Content Selection"));
  children.push(bullet("Annual Quantity, File Attachments"));

  children.push(heading3("Form Variants"));
  children.push(makeTable(
    ["Variant", "Use Case"],
    [
      ["Quick Form", "Captures essential enquiry details with minimal fields"],
      ["Detailed Form", "Comprehensive specification entry including board, GSM, content, dimensions, and processes"],
    ]
  ));

  children.push(heading3("Actions"));
  children.push(richBullet([
    { text: "Submit", bold: true },
    { text: " -- Creates the enquiry in the system and initiates the workflow." },
  ]));
  children.push(richBullet([
    { text: "Save as Draft", bold: true },
    { text: " -- Persists the current form state locally for later completion. The system also performs periodic auto-saves." },
  ]));

  children.push(heading2("6.4 Dynamic Fill Mode"));
  children.push(para("Access the Printing Wizard -- a step-by-step guided form that walks through each specification field sequentially -- via the dynamic mode option."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 7. QUOTATIONS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("7. Quotations"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/quotations    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM, HOD, Vertical Head" },
  ]));

  children.push(heading2("7.1 Viewing Quotations"));
  children.push(para("Quotations are displayed in a data table with columns: Quotation Number, Customer, Job Name, Price, Status, and Date. Use the search bar and column filters to locate specific records."));

  children.push(heading2("7.2 Quotation Detail View"));
  children.push(richBullet([{ text: "Internal Status", bold: true }, { text: " -- Current position in the approval workflow." }]));
  children.push(richBullet([{ text: "Customer Status", bold: true }, { text: " -- External-facing status (Approve / Pending / Reject), selectable via dropdown. Changing status triggers a remarks dialog." }]));
  children.push(richBullet([{ text: "Costing Summary", bold: true }, { text: " -- Complete cost breakdown with KPI indicators." }]));
  children.push(richBullet([{ text: "Target Price Comparison", bold: true }, { text: " -- Visual indicator showing alignment with target pricing." }]));

  children.push(heading2("7.3 Creating a New Quotation"));
  children.push(makeTable(
    ["Option", "Description"],
    [
      ["Chat", "Opens the AI Costing Assistant on the Home page"],
      ["Dynamic Fill", "Opens the Printing Wizard for step-by-step quotation creation"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 8. PROJECTS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("8. Projects"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/projects    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM, HOD, Vertical Head" },
  ]));

  children.push(heading2("8.1 Project Types"));
  children.push(makeTable(
    ["Tab", "Full Name", "Description"],
    [
      ["SDO", "Sales Development Order", "Sales-initiated development projects"],
      ["JDO", "Job Development Order", "Job-specific development projects"],
      ["Commercial", "Commercial Project", "Commercial engagement projects"],
      ["PN", "Production Note", "Production-related notes and orders"],
    ]
  ));

  children.push(heading2("8.2 Viewing Projects"));
  children.push(bullet("Switch between tabs to view projects by type."));
  children.push(bullet("Each tab presents a searchable, filterable data table."));
  children.push(bullet("Click any row to view full project details."));

  children.push(heading2("8.3 Creating a New Project (KAM Only)"));
  children.push(para("Click the floating action button (+) and select the project type. Each form collects customer details, material and process requirements, timeline information, and approval routing assignments."));

  children.push(heading2("8.4 Export"));
  children.push(para("Click the Export button to download project data in spreadsheet format."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 9. ANALYTICS DASHBOARD
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("9. Analytics Dashboard"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/dashboard    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM, HOD, Vertical Head" },
  ]));

  children.push(heading2("9.1 KPI Summary Cards"));
  children.push(makeTable(
    ["KPI", "Description"],
    [
      ["Total Enquiries", "Count of all enquiries in the system"],
      ["Pending Approvals", "Items awaiting approval action"],
      ["Active Projects", "Currently active project count"],
      ["Conversion Rate", "Enquiry-to-quotation conversion percentage"],
    ]
  ));

  children.push(heading2("9.2 Charts and Reports"));
  children.push(bullet("Sales trends over time"));
  children.push(bullet("Project progress tracking"));
  children.push(bullet("Customer acquisition metrics"));
  children.push(bullet("Quotation conversion statistics"));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 10. CUSTOMERS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("10. Customers"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/clients    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM, HOD, Vertical Head" },
  ]));

  children.push(heading2("10.1 Viewing Customers"));
  children.push(para("All customer records are displayed in a searchable table with columns: Customer Name, Contact Person, City, and Status."));

  children.push(heading2("10.2 Creating a New Customer (KAM Only)"));
  children.push(makeTable(
    ["Section", "Fields"],
    [
      ["KAM and Customer Info", "Customer name, contact person, business unit, responsibility assignment"],
      ["Company Details", "Registered address, director names, GST number, PAN"],
      ["Business Information", "Product categories, estimated monthly business value, customer type"],
      ["Payment and Credit", "Payment terms, credit limit, credit period"],
    ]
  ));
  children.push(para('Click "Submit for Approval" to initiate the multi-level approval workflow.'));

  children.push(heading2("10.3 Customer Approval Workflow"));
  children.push(makeTable(
    ["Stage", "Authority", "Role"],
    [
      ["1", "Prepared By", "Marketing"],
      ["2", "Checked and Approved By", "Finance"],
      ["3", "Approved By", "D.V.P Sales"],
      ["4", "Final Approval", "Managing Director"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 11. CONVERSATIONS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("11. Conversations"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/chats    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM" },
  ]));
  children.push(para("All AI chat conversations are listed with chat title, creation date, and last activity timestamp. Click any entry to open the full conversation with inline Costing Summary cards, KPI indicators, and target price comparisons."));
  children.push(para("Click the floating action button to navigate to the Home page and begin a new AI costing session."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 12. ASK RATE
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("12. Ask Rate"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/ask-rate    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM" },
  ]));
  children.push(para("The Ask Rate module enables KAM users to submit structured rate requests to the Purchase department and track responses."));

  children.push(heading2("12.1 Dashboard KPIs"));
  children.push(makeTable(
    ["KPI", "Description"],
    [
      ["Pending", "Number of rate requests awaiting response"],
      ["Overdue", "Requests that have exceeded the SLA response window (24 hours)"],
      ["Answered", "Requests that have received a rate response"],
      ["Total Requests", "Aggregate count of all submitted rate requests"],
    ]
  ));

  children.push(heading2("12.2 Submitting a Rate Request"));
  children.push(heading3("Step 1 -- Select Recipient and Production Unit"));
  children.push(richBullet([{ text: "Select Person", bold: true }, { text: " (required) -- Choose the team member to receive the request." }]));
  children.push(richBullet([{ text: "Production Unit", bold: true }, { text: " (required) -- Select the applicable production unit." }]));

  children.push(heading3("Step 2 -- Specify Item Details"));
  children.push(richBullet([{ text: "Item Group", bold: true }, { text: " (required) -- Select the item group from the dropdown." }]));
  children.push(richBullet([{ text: "Quality", bold: true }, { text: " (required) -- Populated based on selected item group." }]));
  children.push(richBullet([{ text: "GSM From / GSM To", bold: true }, { text: " (required) -- Specify the GSM range." }]));
  children.push(richBullet([{ text: "Mill", bold: true }, { text: " (optional) -- Select the paper mill, if applicable." }]));

  children.push(heading3("Step 3 -- Add Items"));
  children.push(bullet('Click "Add Item" to add the current specification as a line item. Multiple combinations can be added.'));
  children.push(bullet('Click "Show All Items" to view matching items from the item master.'));

  children.push(heading3("Step 4 -- Compose and Send"));
  children.push(richBullet([{ text: "Your Question", bold: true }, { text: " (required) -- Enter the rate request details." }]));
  children.push(bullet('Click "Send Request" to submit.'));
  children.push(spacer(80));
  children.push(para("Upon submission:"));
  children.push(bullet("A record is created in the database with a unique request number (format: RR-YYYYMMDD-NNNN)."));
  children.push(bullet("An email notification is sent to the selected team member from park.buddy@parksonspackaging.com."));
  children.push(bullet('The request appears in the "My Rate Requests" list below the form.'));

  children.push(heading2("12.3 My Rate Requests"));
  children.push(para("All submitted requests are displayed in a scrollable list. Each request card shows the request number, status badge, department, requestor name, item details, question, and provided rate (if answered)."));
  children.push(heading3("Filtering and Sorting"));
  children.push(bullet("Filter by: All Requests, Answered, Unanswered"));
  children.push(bullet("Sort by: Latest First, Oldest First"));

  children.push(heading2("12.4 Request Timeline"));
  children.push(para("Click any request card to open the Request Timeline dialog, which displays the request message, item details, a View Items button, and a chronological timeline of all events (creation, escalation, rate provision)."));

  children.push(heading2("12.5 Providing a Rate (Assigned User Only)"));
  children.push(para('If you are the person assigned to answer a rate request, a "Provide Rate" button appears on the request card. Only the assigned recipient can see and use this button.'));
  children.push(numberedItem('Click "Provide Rate" on the pending request card.', 1));
  children.push(numberedItem("A dialog opens showing the request details.", 2));
  children.push(numberedItem("Enter the rate value in the input field.", 3));
  children.push(numberedItem('Click "Submit Rate" to complete.', 4));
  children.push(spacer(80));
  children.push(para("Upon submission, the request status changes to Completed, the rate is recorded, and an email notification is sent to the original requestor."));

  children.push(heading2("12.6 Escalation"));
  children.push(para("If a rate request is not answered within the defined SLA window, it can be escalated through a three-level hierarchy:"));
  children.push(makeTable(
    ["Level", "Authority"],
    [
      ["1", "Purchase Department"],
      ["2", "Head of Department (HOD)"],
      ["3", "Vertical Head"],
    ]
  ));
  children.push(para("Each escalation triggers an email notification to the newly assigned responsible person."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 13. RATE QUERIES
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("13. Rate Queries"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/rate-queries    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "Purchase" },
  ]));
  children.push(para("The Rate Queries module is the Purchase department's dedicated workspace for managing incoming rate requests."));
  children.push(makeTable(
    ["Feature", "Description"],
    [
      ["Pending Requests", "View all incoming rate queries requiring action"],
      ["Request Timeline", "Detailed workflow progression for each request"],
      ["Rate Submission", "Enter and submit rate responses"],
      ["Status Management", "Update request status as work progresses"],
      ["Request History", "Access historical rate queries and responses"],
      ["Item Master Search", "Look up materials, items, and current pricing"],
      ["Department Filtering", "Filter requests by originating department"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 14. APPROVALS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("14. Approvals"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/approvals    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "HOD, Vertical Head" },
  ]));

  children.push(heading2("14.1 Views"));
  children.push(makeTable(
    ["View", "Description"],
    [
      ["Pending Approvals", "Items currently awaiting your approval decision"],
      ["Approval History", "Previously processed items with their outcomes"],
    ]
  ));

  children.push(heading2("14.2 Available Actions"));
  children.push(makeTable(
    ["Action", "Description"],
    [
      ["Approve", "Accept the request. Optional remarks can be added."],
      ["Reject", "Decline the request. Remarks are mandatory."],
      ["View Details", "Review the complete submission before making a decision."],
      ["Export", "Download approval data in spreadsheet format."],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 15. DRAFTS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("15. Drafts"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/drafts    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM" },
  ]));
  children.push(makeTable(
    ["Feature", "Description"],
    [
      ["View Drafts", "Browse all auto-saved and manually saved draft enquiries"],
      ["Continue Editing", "Resume work on an incomplete draft"],
      ["Delete", "Permanently remove an unwanted draft"],
      ["Submit", "Convert a completed draft into a formal enquiry"],
    ]
  ));
  children.push(note("The system performs periodic auto-saves while the enquiry form is active. Work-in-progress is preserved automatically."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 16. CUSTOMER HISTORY
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("16. Customer History"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/customer-history    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "KAM, HOD, Vertical Head" },
  ]));

  children.push(heading2("16.1 Search and Filter"));
  children.push(makeTable(
    ["Control", "Description"],
    [
      ["Search", "Filter by Request ID, Customer Name, or KAM Name"],
      ["Voice Input", "Click the microphone icon to search using voice"],
      ["Status Filter", "Filter by Pending, Approved, or Rejected"],
      ["KAM Name Filter", "Filter by the assigned Key Account Manager"],
    ]
  ));

  children.push(heading2("16.2 Detail View"));
  children.push(para("Click any row to open the full approval workflow timeline showing the four-stage approval chain (Marketing, Finance, D.V.P Sales, Managing Director), with approver name, date, and status for each stage."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 17. PROFILE AND PASSWORD MANAGEMENT
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("17. Profile and Password Management"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/profile    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "All roles" },
  ]));

  children.push(heading2("17.1 Profile Information"));
  children.push(para("The profile page displays the following read-only information retrieved from the system:"));
  children.push(makeTable(
    ["Field", "Description"],
    [
      ["Full Name", "User's registered full name"],
      ["Username", "Login username"],
      ["Email Address", "Registered email"],
      ["Phone Number", "Contact number"],
      ["Company", "Associated company"],
      ["Designation", "Job title or designation"],
      ["Role", "System role (KAM / HOD / Vertical Head / Purchase)"],
      ["Location", "City and state"],
    ]
  ));
  children.push(para("The profile avatar displays the user's initials on a branded background. Profile information is managed centrally by the system administrator and cannot be edited from this page."));

  children.push(heading2("17.2 Reset Password"));
  children.push(heading3("Step 1 -- Request Verification Code"));
  children.push(numberedItem('Click the "Reset Password" button on the profile page.', 1));
  children.push(numberedItem("Your registered email address is pre-filled and displayed.", 2));
  children.push(numberedItem('Click "Send Verification Code".', 3));
  children.push(numberedItem("A six-digit OTP is sent to your email from park.buddy@parksonspackaging.com.", 4));

  children.push(heading3("Step 2 -- Verify Code"));
  children.push(numberedItem("Enter the six-digit code in the input fields.", 1));
  children.push(numberedItem("A five-minute countdown timer displays the remaining validity.", 2));
  children.push(numberedItem('Click "Verify Code" to proceed.', 3));

  children.push(heading3("Step 3 -- Set New Password"));
  children.push(numberedItem("Enter your new password.", 1));
  children.push(numberedItem("Confirm the new password by entering it again.", 2));
  children.push(numberedItem('Click "Reset Password" to save.', 3));

  children.push(heading3("Step 4 -- Confirmation"));
  children.push(para('A success message confirms that your password has been updated. Click "Done" to return to the profile page.'));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 18. SETTINGS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("18. Settings"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/settings    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "All roles" },
  ]));

  children.push(heading2("18.1 Text Size"));
  children.push(makeTable(
    ["Option", "Font Size", "Description"],
    [
      ["Small", "16px", "Compact display, more content visible"],
      ["Medium", "18px", "Standard readability"],
      ["Large", "20px", "Recommended default for comfortable reading"],
    ]
  ));
  children.push(para("The selected size persists across sessions."));

  children.push(heading2("18.2 Application Information"));
  children.push(makeTable(
    ["Item", "Value"],
    [
      ["Version", "2.0"],
      ["Build", "2026.03"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 19. NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("19. Notifications"));
  children.push(richPara([
    { text: "URL: ", bold: true, color: GRAY },
    { text: "https://parkbuddy.ai/notifications    " },
    { text: "Available to: ", bold: true, color: GRAY },
    { text: "All roles" },
  ]));
  children.push(makeTable(
    ["Type", "Description"],
    [
      ["System Alerts", "Application updates and maintenance notices"],
      ["Approval Notifications", "Items approved or rejected in the workflow"],
      ["Quotation Activity", "New quotation requests and status changes"],
      ["Order Updates", "Status changes on active orders"],
    ]
  ));
  children.push(para("Click any notification to navigate directly to the relevant module and record."));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 20. EMAIL NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("20. Email Notifications"));
  children.push(para("ParkBuddy sends automated email notifications for critical workflow events. All emails are sent from park.buddy@parksonspackaging.com via the Microsoft Graph API integrated email service."));

  children.push(heading2("20.1 Notification Triggers"));
  children.push(makeTable(
    ["Event", "Recipient", "Email Content"],
    [
      ["Rate Request Submitted", "Assigned team member", "Request details, item specifications, question, and Answer Query button"],
      ["Rate Provided", "Original requestor (KAM)", "Confirmation of the provided rate with request number and item details"],
      ["Request Escalated", "Newly assigned responsible person", "Escalation alert with request details and urgency notice"],
      ["Password Reset OTP", "User requesting reset", "Six-digit verification code with five-minute validity"],
      ["Login OTP (2FA)", "User logging in", "Six-digit verification code for two-factor authentication"],
    ]
  ));

  children.push(heading2("20.2 Email Appearance"));
  children.push(bullet("Branded header with ParkBuddy logo and corporate gradient"));
  children.push(bullet("Clear, structured content layout"));
  children.push(bullet("Action buttons linking directly to the relevant ParkBuddy page"));
  children.push(bullet("Footer with copyright notice"));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 21. USER ROLES AND PERMISSIONS
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("21. User Roles and Permissions"));

  children.push(heading2("21.1 KAM (Key Account Manager)"));
  children.push(makeTable(
    ["Capability", "Access Level"],
    [
      ["AI Costing Assistant", "Full access"],
      ["Create Enquiries", "Full access"],
      ["Create Quotations", "Full access"],
      ["Create Projects", "Full access"],
      ["Create Customers", "Full access (submit for approval)"],
      ["Submit Rate Requests", "Full access"],
      ["View Analytics", "Full access"],
      ["Manage Conversations", "Full access"],
      ["Manage Drafts", "Full access"],
      ["Profile and Settings", "Full access"],
    ]
  ));

  children.push(heading2("21.2 HOD / Vertical Head"));
  children.push(makeTable(
    ["Capability", "Access Level"],
    [
      ["Approve / Reject Requests", "Full access"],
      ["View Approval History", "Full access"],
      ["View Quotations", "Read-only"],
      ["View Projects", "Read-only"],
      ["View Analytics", "Full access"],
      ["View Customers", "Read-only"],
      ["Export Data", "Full access"],
      ["Profile and Settings", "Full access"],
    ]
  ));

  children.push(heading2("21.3 Purchase"));
  children.push(makeTable(
    ["Capability", "Access Level"],
    [
      ["View Rate Queries", "Full access"],
      ["Respond to Rate Requests", "Full access"],
      ["View Request History", "Full access"],
      ["Item Master Search", "Full access"],
      ["Provide Rate", "Full access (only for assigned requests)"],
      ["Profile and Settings", "Full access"],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 22. TROUBLESHOOTING
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("22. Troubleshooting"));
  children.push(makeTable(
    ["Issue", "Possible Cause", "Resolution"],
    [
      ["Invalid username or password", "Incorrect credentials", "Verify credentials. Contact administrator if issue persists."],
      ["OTP not received", "Email delivery delay", 'Wait 60 seconds and click "Resend OTP". Check spam folder.'],
      ["OTP expired", "Code validity exceeded 5 minutes", "Click Resend OTP for a new code."],
      ["Page not loading", "Network connectivity issue", "Verify internet connection. Clear browser cache and refresh."],
      ["Form validation error", "Required fields not completed", "Complete all fields marked with a red asterisk (*)."],
      ["Rate API not configured", "Environment configuration issue", "Contact system administrator."],
      ["Email not received", "Email service issue", "Verify recipient address. Contact support if persistent."],
      ["Failed to send request", "Server connectivity issue", "Retry after a few moments. Contact support if persistent."],
    ]
  ));

  children.push(pageBreak());

  // ════════════════════════════════════════════════════════════════════
  // 23. SUPPORT
  // ════════════════════════════════════════════════════════════════════
  children.push(heading1("23. Support"));
  children.push(para("For technical support, bug reports, or feature requests:"));
  children.push(makeTable(
    ["Contact", "Detail"],
    [
      ["Service Provider", "IndusAnalytics"],
      ["Email", "support@indusanalytics.co.in"],
      ["Application URL", "https://parkbuddy.ai"],
    ]
  ));

  children.push(spacer(600));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 3, color: BLUE } },
    children: [],
  }));
  children.push(spacer(100));
  children.push(para("This document is confidential and intended solely for authorized users of the ParkBuddy application.", { align: AlignmentType.CENTER, size: 18, color: GRAY }));
  children.push(para("Unauthorized distribution or reproduction is prohibited.", { align: AlignmentType.CENTER, size: 18, color: GRAY }));
  children.push(spacer(100));
  children.push(para("Copyright 2026 IndusAnalytics. All rights reserved.", { align: AlignmentType.CENTER, size: 18, color: GRAY, italic: true }));
  children.push(para("Developed for Parksons Packaging Ltd.", { align: AlignmentType.CENTER, size: 18, color: GRAY, italic: true }));

  // ════════════════════════════════════════════════════════════════════
  // CREATE DOCUMENT
  // ════════════════════════════════════════════════════════════════════
  const doc = new Document({
    creator: "IndusAnalytics",
    title: "ParkBuddy - User Manual",
    description: "User Manual for ParkBuddy KAM Dashboard - Parksons Packaging Ltd.",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: DARK },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            right: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.8),
          },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "ParkBuddy User Manual", size: 16, color: GRAY, font: "Calibri", italics: true }),
              new TextRun({ text: "  |  ", size: 16, color: GRAY }),
              new TextRun({ text: "Confidential", size: 16, color: RED, font: "Calibri", bold: true }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: LIGHT_GRAY } },
            children: [
              new TextRun({ text: "Parksons Packaging Ltd.  |  IndusAnalytics  |  Page ", size: 16, color: GRAY, font: "Calibri" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY, font: "Calibri" }),
              new TextRun({ text: " of ", size: 16, color: GRAY, font: "Calibri" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY, font: "Calibri" }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/Users/Jatin/Downloads/ParkBuddy_User_Manual_v2.0.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated: " + outputPath);
}

generate().catch(err => { console.error(err); process.exit(1); });
