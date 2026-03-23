
---

# ParkBuddy

## User Manual

**Version:** 2.0
**Date:** March 2026
**Prepared by:** IndusAnalytics
**Prepared for:** Parksons Packaging Ltd.
**Classification:** Confidential

---

## Document Control

| Item | Detail |
|------|--------|
| Document Title | ParkBuddy -- User Manual |
| Version | 2.0 |
| Status | Released |
| Author | IndusAnalytics |
| Client | Parksons Packaging Ltd. |
| Application URL | https://parkbuddy.ai |

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Requirements](#2-system-requirements)
3. [Login and Authentication](#3-login-and-authentication)
4. [Navigation and Layout](#4-navigation-and-layout)
5. [Home -- AI Costing Assistant](#5-home----ai-costing-assistant)
6. [Enquiries](#6-enquiries)
7. [Quotations](#7-quotations)
8. [Projects](#8-projects)
9. [Analytics Dashboard](#9-analytics-dashboard)
10. [Customers](#10-customers)
11. [Conversations](#11-conversations)
12. [Ask Rate](#12-ask-rate)
13. [Rate Queries](#13-rate-queries)
14. [Approvals](#14-approvals)
15. [Drafts](#15-drafts)
16. [Customer History](#16-customer-history)
17. [Profile and Password Management](#17-profile-and-password-management)
18. [Settings](#18-settings)
19. [Notifications](#19-notifications)
20. [Email Notifications](#20-email-notifications)
21. [User Roles and Permissions](#21-user-roles-and-permissions)
22. [Troubleshooting](#22-troubleshooting)
23. [Support](#23-support)

---

## 1. Overview

ParkBuddy is an enterprise-grade Key Account Manager (KAM) platform developed by IndusAnalytics for Parksons Packaging Ltd. The application centralizes the complete sales and procurement workflow into a single, role-based interface.

### 1.1 Core Capabilities

| Capability | Description |
|------------|-------------|
| AI-Powered Costing | Conversational chatbot that generates quotation costings from product specifications |
| Enquiry Management | Create, track, and manage customer enquiries with manual and dynamic form options |
| Quotation Workflow | Full quotation lifecycle with cost breakdowns, KPI analysis, and target price comparison |
| Project Tracking | Multi-type project management (SDO, JDO, Commercial, PN) |
| Customer Onboarding | Multi-level approval workflow for new customer registration |
| Rate Management | Structured rate request and response workflow between KAM and Purchase teams |
| Email Notifications | Automated email alerts via Microsoft Graph API for rate requests, OTP verification, and escalations |
| Role-Based Access | Distinct interfaces and permissions for KAM, HOD, Vertical Head, and Purchase users |
| Two-Factor Authentication | OTP-based login verification sent to registered email |
| Responsive Design | Full functionality across desktop, tablet, and mobile devices |

### 1.2 User Roles

| Role | Primary Function |
|------|-----------------|
| KAM (Key Account Manager) | Sales workflow -- enquiries, quotations, customer management, rate requests |
| H.O.D (Head of Department) | Approval authority -- reviews and approves quotations, customers, rates |
| Vertical Head | Senior approval authority -- final sign-off on critical items |
| Purchase | Procurement -- responds to rate queries, manages item pricing |

---

## 2. System Requirements

### 2.1 Supported Browsers

| Browser | Minimum Version |
|---------|----------------|
| Google Chrome | 90 or later |
| Microsoft Edge | 90 or later |
| Mozilla Firefox | 88 or later |
| Apple Safari | 14 or later |

### 2.2 Device Requirements

- Stable internet connection
- Screen resolution: 360px minimum width (mobile), 1024px or higher recommended (desktop)
- JavaScript must be enabled

### 2.3 Access

- URL: **https://parkbuddy.ai**
- Credentials are provisioned by the system administrator

---

## 3. Login and Authentication

**URL:** https://parkbuddy.ai/login

### 3.1 Standard Login

1. Navigate to the login page.
2. Enter your **Username** in the designated field.
3. Enter your **Password**.
4. Optionally enable **"Remember me"** to persist credentials across sessions.
5. Click **"Sign In"**.

### 3.2 Two-Factor Authentication (OTP)

If your account has two-factor authentication enabled and a registered email address on file:

1. After entering valid credentials, the system transitions to the OTP verification screen.
2. A six-digit verification code is sent to your registered email address (displayed in masked format, e.g., `ab***@gmail.com`).
3. Enter the code in the six input fields. Each field automatically advances to the next upon entry.
4. Alternatively, paste a copied code -- the system distributes digits across all fields automatically.
5. The code **auto-submits** once all six digits are entered.
6. A five-minute countdown timer displays the remaining validity period.
7. If the code expires or is not received, click **"Resend OTP"** (available after a 60-second cooldown).
8. Click **"Back to Login"** to return to the credentials screen.

**Note:** Accounts without a registered email address bypass OTP verification and proceed directly to the dashboard.

### 3.3 Post-Login Routing

The system routes users to their designated landing page based on role:

| Role | Landing Page |
|------|-------------|
| KAM | Home (AI Costing Assistant) |
| H.O.D / Vertical Head | Approvals |
| Purchase | Rate Queries |

---

## 4. Navigation and Layout

### 4.1 Desktop Layout

- **Left Sidebar** -- Primary navigation panel listing all accessible modules. The sidebar is collapsible; click the collapse icon to toggle between full-label and icon-only modes. Each menu item displays a badge count indicating pending or active items.
- **Top Header** -- Displays the current page title, a back-navigation button (where applicable), and contextual action buttons.

### 4.2 Mobile Layout

- **Bottom Navigation Bar** -- Provides quick access to five primary modules: Home, Enquiries, Quotations, Conversations, and More.
- **"More" Page** -- A grid-based menu providing access to all remaining modules: Dashboard, Profile, Customers, Projects, Approvals, Settings, and Logout.

### 4.3 Module Access by Role

| Module | KAM | HOD / Vertical Head | Purchase |
|--------|:---:|:-------------------:|:--------:|
| Home (AI Chat) | Yes | -- | -- |
| Enquiries | Yes | -- | -- |
| Quotations | Yes | Yes | -- |
| Projects | Yes | Yes | -- |
| Analytics | Yes | Yes | -- |
| Customers | Yes | Yes | -- |
| Conversations | Yes | -- | -- |
| Ask Rate | Yes | -- | -- |
| Rate Queries | -- | -- | Yes |
| Approvals | -- | Yes | -- |
| Settings | Yes | Yes | Yes |
| Profile | Yes | Yes | Yes |

---

## 5. Home -- AI Costing Assistant

**URL:** https://parkbuddy.ai
**Available to:** KAM

The Home page serves as the primary workspace for KAM users, providing an AI-powered conversational interface for generating quotation costings.

### 5.1 Welcome Screen

Upon loading, the page displays:
- A personalized greeting message.
- A **"Recent Chats"** section listing previous conversations for quick resumption.
- Quick-start prompts (e.g., "I want costing") to initiate a new session.

### 5.2 Starting a Costing Conversation

1. Click **"I want costing"** or type a product-related query.
2. The AI assistant (ParkBuddy) initiates a structured conversation, requesting:
   - Product type and category
   - Dimensions (height, length, width)
   - Material specifications
   - Quantity and printing requirements
   - Special finishing or processing needs
3. Based on the collected inputs, ParkBuddy generates a **Costing Summary** card containing:
   - **Annual Quantity** and **Kgs per 1000 pcs**
   - **KPI Indicators** -- RMC%, PSR, PKR
   - **Detailed Cost Breakdown** -- Material, Machine, Labour, Overheads, and additional cost components
   - **Target Price Comparison** -- Visual indicator showing alignment with target pricing
   - **Status** and **Recommended Next Steps**
4. Continue the conversation to refine parameters, adjust specifications, or request alternative scenarios.

### 5.3 Resuming a Previous Conversation

- Click any entry under **"Recent Chats"** on the welcome screen.
- Alternatively, navigate to the **Conversations** module and select the desired chat.

---

## 6. Enquiries

**URL:** https://parkbuddy.ai/inquiries
**Available to:** KAM

### 6.1 Viewing Enquiries

All enquiries are presented in a searchable, filterable data table with the following columns:
- Enquiry Number, Customer, Job Name, Quantity, Date, Status

### 6.2 Creating a New Enquiry

Click the floating action button (+) at the bottom-right corner to access creation options:

| Option | Description |
|--------|-------------|
| New Enquiry | Opens the manual enquiry form |
| Drafts | Access previously saved draft enquiries |

### 6.3 Manual Enquiry Form

The enquiry form collects product and customer specifications in a structured layout.

**Required Fields (indicated by red asterisk):**
- Client Name
- Job Name
- Quantity
- Sales Person
- Plant
- Payment Terms

**Optional Fields:**
- Contact Person, Email, Mobile Number
- Enquiry Date, Reference Number
- Supply Location
- Product Dimensions (Height, Length, Width, etc.)
- Board Type, GSM, Content Selection
- Annual Quantity (required for the detailed form variant)
- File Attachments

**Form Variants:**

| Variant | Use Case |
|---------|----------|
| Quick Form | Captures essential enquiry details with minimal fields |
| Detailed Form | Comprehensive specification entry including board, GSM, content, dimensions, and processes |

**Actions:**
- **Submit** -- Creates the enquiry in the system and initiates the workflow.
- **Save as Draft** -- Persists the current form state locally for later completion. The system also performs periodic auto-saves.

### 6.4 Dynamic Fill Mode

Navigate to the enquiry creation page with the dynamic mode parameter to access the **Printing Wizard** -- a step-by-step guided form that walks through each specification field sequentially.

---

## 7. Quotations

**URL:** https://parkbuddy.ai/quotations
**Available to:** KAM, HOD, Vertical Head

### 7.1 Viewing Quotations

Quotations are displayed in a data table with the following columns:
- Quotation Number, Customer, Job Name, Price, Status, Date

Use the search bar and column filters to locate specific records.

### 7.2 Quotation Detail View

Selecting a quotation displays its full detail, including:
- **Internal Status** -- Current position in the approval workflow
- **Customer Status** -- External-facing status (Approve / Pending / Reject), selectable via dropdown. Changing status triggers a remarks dialog for documentation.
- **Costing Summary** -- Complete cost breakdown with KPI indicators
- **Target Price Comparison** -- Visual comparison against the defined target

### 7.3 Creating a New Quotation

Click the floating action button (+) to access:

| Option | Description |
|--------|-------------|
| Chat | Opens the AI Costing Assistant on the Home page |
| Dynamic Fill | Opens the Printing Wizard for step-by-step quotation creation |

---

## 8. Projects

**URL:** https://parkbuddy.ai/projects
**Available to:** KAM, HOD, Vertical Head

### 8.1 Project Types

Projects are organized into four categories, accessible via tabs:

| Tab | Full Name | Description |
|-----|-----------|-------------|
| SDO | Sales Development Order | Sales-initiated development projects |
| JDO | Job Development Order | Job-specific development projects |
| Commercial | Commercial Project | Commercial engagement projects |
| PN | Production Note | Production-related notes and orders |

### 8.2 Viewing Projects

- Switch between tabs to view projects by type.
- Each tab presents a searchable, filterable data table.
- Click any row to view full project details.

### 8.3 Creating a New Project (KAM Only)

Click the floating action button (+) and select the project type (SDO, JDO, or Commercial). Each form collects:
- Customer details and job specifications
- Material and process requirements
- Timeline and delivery information
- Approval routing assignments

### 8.4 Export

Click the **Export** button to download project data in spreadsheet format.

---

## 9. Analytics Dashboard

**URL:** https://parkbuddy.ai/dashboard
**Available to:** KAM, HOD, Vertical Head

### 9.1 KPI Summary Cards

Four key performance indicators are displayed at the top of the dashboard:

| KPI | Description |
|-----|-------------|
| Total Enquiries | Count of all enquiries in the system |
| Pending Approvals | Items awaiting approval action |
| Active Projects | Currently active project count |
| Conversion Rate | Enquiry-to-quotation conversion percentage |

Each card displays the metric title, current value, a decorative background icon, and a navigation arrow for drill-down access.

### 9.2 Charts and Reports

The dashboard includes visual representations of:
- Sales trends over time
- Project progress tracking
- Customer acquisition metrics
- Quotation conversion statistics

### 9.3 Export

Click the **Export** floating action button to download the analytics report.

---

## 10. Customers

**URL:** https://parkbuddy.ai/clients
**Available to:** KAM, HOD, Vertical Head

### 10.1 Viewing Customers

All customer records are displayed in a searchable table with columns:
- Customer Name, Contact Person, City, Status

### 10.2 Creating a New Customer (KAM Only)

Click the floating action button (+) and select **New Customer** to open the creation dialog. The form is organized into four sections:

| Section | Fields |
|---------|--------|
| KAM and Customer Info | Customer name, contact person, business unit, responsibility assignment |
| Company Details | Registered address, director names, GST number, PAN |
| Business Information | Product categories, estimated monthly business value, customer type (New / 2P / 3P) |
| Payment and Credit | Payment terms, credit limit, credit period |

Click **"Submit for Approval"** to initiate the multi-level approval workflow.

### 10.3 Customer Approval Workflow

After submission, the customer record progresses through a four-stage approval chain:

| Stage | Authority | Role |
|-------|-----------|------|
| 1 | Prepared By | Marketing |
| 2 | Checked and Approved By | Finance |
| 3 | Approved By | D.V.P Sales |
| 4 | Final Approval | Managing Director |

Progress can be tracked via the **Customer History** module.

---

## 11. Conversations

**URL:** https://parkbuddy.ai/chats
**Available to:** KAM

### 11.1 Conversation List

All AI chat conversations are listed with:
- Chat title or topic
- Creation date
- Last activity timestamp

Click any entry to open the full conversation.

### 11.2 Conversation Detail View

The detail view displays the complete message history with the AI assistant, including:
- All user messages and AI responses
- Inline **Costing Summary** cards with full cost breakdowns, KPI indicators, and target price comparisons
- Contextual follow-up suggestions

### 11.3 Starting a New Conversation

Click the floating action button to navigate to the Home page and begin a new AI costing session.

---

## 12. Ask Rate

**URL:** https://parkbuddy.ai/ask-rate
**Available to:** KAM

The Ask Rate module enables KAM users to submit structured rate requests to the Purchase department and track responses.

### 12.1 Dashboard KPIs

Four KPI cards are displayed at the top of the page:

| KPI | Description |
|-----|-------------|
| Pending | Number of rate requests awaiting response |
| Overdue | Requests that have exceeded the SLA response window (24 hours) |
| Answered | Requests that have received a rate response |
| Total Requests | Aggregate count of all submitted rate requests |

### 12.2 Submitting a Rate Request

The request form is organized as follows:

**Step 1 -- Select Recipient and Production Unit**
- **Select Person** (required) -- Choose the team member to receive the request. The system auto-populates their department.
- **Production Unit** (required) -- Select the applicable production unit.

**Step 2 -- Specify Item Details**
- **Item Group** (required) -- Select the item group from the dropdown.
- **Quality** (required) -- Populated based on the selected item group.
- **GSM From / GSM To** (required) -- Specify the GSM range.
- **Mill** (optional) -- Select the paper mill, if applicable.

**Step 3 -- Add Items**
- Click **"Add Item"** to add the current specification as a line item. Multiple combinations can be added.
- Click **"Show All Items"** to view matching items from the item master based on the selected criteria.

**Step 4 -- Compose and Send**
- **Your Question** (required) -- Enter the rate request details or any specific instructions.
- Click **"Send Request"** to submit.

Upon submission:
- A record is created in the database with a unique request number (format: RR-YYYYMMDD-NNNN).
- An email notification is sent to the selected team member via the automated email service (sent from park.buddy@parksonspackaging.com).
- The request appears in the "My Rate Requests" list below.

### 12.3 My Rate Requests

Below the form, all submitted requests are displayed in a scrollable list. Each request card shows:
- **Request Number** and **Status Badge** (Pending / Answered / Escalated)
- **Department** assignment
- **Requestor Name**
- **Item Details** -- Item Group, Quality, Mill, GSM Range
- **Question** -- The original request message
- **Provided Rate** (if answered) -- Displayed in a green highlight with the rate value

**Filtering and Sorting:**
- Filter by: All Requests, Answered, Unanswered
- Sort by: Latest First, Oldest First

### 12.4 Request Timeline

Click any request card to open the **Request Timeline** dialog, which displays:
- Request message and item details
- A **"View Items"** button to see all matching items from the item master
- Chronological timeline entries showing:
  - Request creation
  - Escalation events (if any)
  - Rate provision
  - Each entry shows the escalation level, action, date, user name, and role

### 12.5 Providing a Rate (Assigned User Only)

If you are the person assigned to answer a rate request, a **"Provide Rate"** button appears on the request card. Only the assigned recipient can see and use this button.

1. Click **"Provide Rate"** on the pending request card.
2. A dialog opens showing the request details (item group, quality, GSM range, mill, question).
3. Enter the rate value in the input field.
4. Click **"Submit Rate"** to complete.

Upon submission:
- The request status changes to **Completed**.
- The provided rate is recorded in the database.
- An email notification is sent to the original requestor confirming the rate.

### 12.6 Escalation

If a rate request is not answered within the defined SLA window, it can be escalated through a three-level hierarchy:

| Level | Authority |
|-------|-----------|
| 1 | Purchase Department |
| 2 | Head of Department (HOD) |
| 3 | Vertical Head |

Each escalation triggers an email notification to the newly assigned responsible person.

---

## 13. Rate Queries

**URL:** https://parkbuddy.ai/rate-queries
**Available to:** Purchase

The Rate Queries module is the Purchase department's dedicated workspace for managing incoming rate requests.

### 13.1 Features

| Feature | Description |
|---------|-------------|
| Pending Requests | View all incoming rate queries requiring action |
| Request Timeline | Detailed workflow progression for each request |
| Rate Submission | Enter and submit rate responses |
| Status Management | Update request status as work progresses |
| Request History | Access historical rate queries and responses |
| Item Master Search | Look up materials, items, and current pricing |
| Department Filtering | Filter requests by originating department |

---

## 14. Approvals

**URL:** https://parkbuddy.ai/approvals
**Available to:** HOD, Vertical Head

### 14.1 Views

Toggle between two views using the floating action button:

| View | Description |
|------|-------------|
| Pending Approvals | Items currently awaiting your approval decision |
| Approval History | Previously processed items with their outcomes |

### 14.2 Approval Types

- Quotation approvals
- Customer creation approvals
- Rate approvals

### 14.3 Available Actions

| Action | Description |
|--------|-------------|
| Approve | Accept the request. Optional remarks can be added. |
| Reject | Decline the request. Remarks are mandatory. |
| View Details | Review the complete submission before making a decision. |
| Export | Download approval data in spreadsheet format. |

---

## 15. Drafts

**URL:** https://parkbuddy.ai/drafts
**Available to:** KAM

### 15.1 Features

| Feature | Description |
|---------|-------------|
| View Drafts | Browse all auto-saved and manually saved draft enquiries |
| Continue Editing | Resume work on an incomplete draft |
| Delete | Permanently remove an unwanted draft |
| Submit | Convert a completed draft into a formal enquiry |

**Note:** The system performs periodic auto-saves while the enquiry form is active. Work-in-progress is preserved automatically.

---

## 16. Customer History

**URL:** https://parkbuddy.ai/customer-history
**Available to:** KAM, HOD, Vertical Head

### 16.1 Search and Filter

| Control | Description |
|---------|-------------|
| Search | Filter by Request ID, Customer Name, or KAM Name |
| Voice Input | Click the microphone icon to search using voice |
| Status Filter | Filter by Pending, Approved, or Rejected |
| KAM Name Filter | Filter by the assigned Key Account Manager |

### 16.2 Table Columns

| Column | Description |
|--------|-------------|
| Request ID | Unique identifier for the customer creation request |
| Customer Name | Company name |
| KAM Name | Assigned Key Account Manager |
| Submitted Date | Date the request was created |
| Status | Approved (green), Pending (yellow), or Rejected (red) |

### 16.3 Detail View

Click any row to open the full **approval workflow timeline**, which shows the four-stage approval chain:

| Stage | Authority | Information Displayed |
|-------|-----------|----------------------|
| 1 | Prepared By (Marketing) | Approver name, date, status |
| 2 | Checked and Approved By (Finance) | Approver name, date, status |
| 3 | Approved By (D.V.P Sales) | Approver name, date, status |
| 4 | Final Approval (Managing Director) | Approver name, date, status |

---

## 17. Profile and Password Management

**URL:** https://parkbuddy.ai/profile
**Available to:** All roles

### 17.1 Profile Information

The profile page displays the following read-only information retrieved from the system:

| Field | Description |
|-------|-------------|
| Full Name | User's registered full name |
| Username | Login username |
| Email Address | Registered email |
| Phone Number | Contact number |
| Company | Associated company |
| Designation | Job title or designation |
| Role | System role (KAM / HOD / Vertical Head / Purchase) |
| Location | City and state |

The profile avatar displays the user's initials on a branded background. Profile information is managed centrally by the system administrator and cannot be edited from this page.

### 17.2 Reset Password

To change your password:

**Step 1 -- Request Verification Code**
1. Click the **"Reset Password"** button on the profile page.
2. Your registered email address is pre-filled and displayed.
3. Click **"Send Verification Code"**.
4. A six-digit OTP is sent to your email from park.buddy@parksonspackaging.com.

**Step 2 -- Verify Code**
1. Enter the six-digit code in the input fields.
2. A five-minute countdown timer displays the remaining validity.
3. Click **"Verify Code"** to proceed.
4. If the code expires, click **"Resend Code"** (available after a 60-second cooldown).

**Step 3 -- Set New Password**
1. Enter your new password.
2. Confirm the new password by entering it again.
3. Click **"Reset Password"** to save.

**Step 4 -- Confirmation**
A success message confirms that your password has been updated. Click **"Done"** to return to the profile page.

---

## 18. Settings

**URL:** https://parkbuddy.ai/settings
**Available to:** All roles

### 18.1 Text Size

Adjust the application's font size to your preference:

| Option | Font Size | Description |
|--------|-----------|-------------|
| Small | 16px | Compact display, more content visible |
| Medium | 18px | Standard readability |
| Large | 20px | Recommended default for comfortable reading |

Each option includes a text preview. The selected size persists across sessions.

### 18.2 Application Information

| Item | Value |
|------|-------|
| Version | 2.0 |
| Build | 2026.03 |

---

## 19. Notifications

**URL:** https://parkbuddy.ai/notifications
**Available to:** All roles

### 19.1 Notification Types

| Type | Description |
|------|-------------|
| System Alerts | Application updates and maintenance notices |
| Approval Notifications | Items approved or rejected in the workflow |
| Quotation Activity | New quotation requests and status changes |
| Order Updates | Status changes on active orders |

Click any notification to navigate directly to the relevant module and record.

---

## 20. Email Notifications

ParkBuddy sends automated email notifications for critical workflow events. All emails are sent from **park.buddy@parksonspackaging.com** via the Microsoft Graph API integrated email service.

### 20.1 Notification Triggers

| Event | Recipient | Email Content |
|-------|-----------|---------------|
| Rate Request Submitted | Assigned team member | Request details, item specifications, question, and "Answer Query" button linking to ParkBuddy |
| Rate Provided | Original requestor (KAM) | Confirmation of the provided rate, request number, item details |
| Request Escalated | Newly assigned responsible person | Escalation alert with request details and urgency notice |
| Password Reset OTP | User requesting reset | Six-digit verification code with five-minute validity |
| Login OTP (2FA) | User logging in | Six-digit verification code for two-factor authentication |

### 20.2 Email Appearance

All emails follow the Parksons Packaging branding:
- Branded header with ParkBuddy logo and gradient (corporate blue #005180 to green #78BE20)
- Clear, structured content layout
- Action buttons linking directly to the relevant ParkBuddy page
- Footer with copyright notice

---

## 21. User Roles and Permissions

### 21.1 KAM (Key Account Manager)

| Capability | Access Level |
|------------|-------------|
| AI Costing Assistant | Full access |
| Create Enquiries | Full access |
| Create Quotations | Full access |
| Create Projects | Full access |
| Create Customers | Full access (submit for approval) |
| Submit Rate Requests | Full access |
| View Analytics | Full access |
| Manage Conversations | Full access |
| Manage Drafts | Full access |
| View Customer History | Full access |
| Profile and Settings | Full access |

### 21.2 HOD / Vertical Head

| Capability | Access Level |
|------------|-------------|
| Approve / Reject Requests | Full access |
| View Approval History | Full access |
| View Quotations | Read-only |
| View Projects | Read-only |
| View Analytics | Full access |
| View Customers | Read-only |
| Export Data | Full access |
| Profile and Settings | Full access |

### 21.3 Purchase

| Capability | Access Level |
|------------|-------------|
| View Rate Queries | Full access |
| Respond to Rate Requests | Full access |
| View Request History | Full access |
| Item Master Search | Full access |
| Provide Rate | Full access (only for assigned requests) |
| Profile and Settings | Full access |

---

## 22. Troubleshooting

| Issue | Possible Cause | Resolution |
|-------|---------------|------------|
| "Invalid username or password" | Incorrect credentials entered | Verify your username and password. Contact the system administrator if the issue persists. |
| OTP not received | Email delivery delay or spam filtering | Wait 60 seconds and click "Resend OTP". Check your spam/junk folder. Verify your registered email with the administrator. |
| OTP expired | Code validity exceeded five minutes | Click "Resend OTP" to receive a new code. |
| Page not loading | Network connectivity issue | Verify your internet connection. Clear the browser cache and refresh the page. |
| Form validation error | Required fields not completed | Complete all fields marked with a red asterisk (*) before submitting. |
| "Rate API not configured" | Environment configuration issue | Contact the system administrator to verify server configuration. |
| Request card shows empty data | Data mapping issue | Refresh the page. If the issue persists, contact support. |
| Email notification not received | Email service configuration | Verify the recipient email address. Contact support if emails are consistently not delivered. |
| "Failed to send request" | Server or database connectivity | Retry after a few moments. If the issue persists, contact support. |

---

## 23. Support

For technical support, bug reports, or feature requests, please contact:

| Contact | Detail |
|---------|--------|
| Service Provider | IndusAnalytics |
| Email | support@indusanalytics.co.in |
| Application URL | https://parkbuddy.ai |

---

*This document is confidential and intended solely for authorized users of the ParkBuddy application. Unauthorized distribution or reproduction is prohibited.*

*Copyright 2026 IndusAnalytics. All rights reserved.*
*Developed for Parksons Packaging Ltd.*
