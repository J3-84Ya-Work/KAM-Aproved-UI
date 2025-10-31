# Quick Setup Guide for ParkBuddy Database

## Step 1: Create Database

Open SQL Server Management Studio (SSMS) and run:

```sql
CREATE DATABASE parkbuddy;
GO

USE parkbuddy;
GO
```

## Step 2: Run Schema

1. Open `schema-mssql.sql` in SSMS
2. Make sure you're connected to the `parkbuddy` database
3. Execute the entire script (F5)

This will create all 9 tables:
- users
- clients
- inquiries
- quotations
- approvals
- projects
- quotation_history
- notifications
- activity_log

## Step 3: Insert Sample Data

1. Open `sample-data.sql` in SSMS
2. Make sure you're connected to the `parkbuddy` database
3. Execute the entire script (F5)

This will insert:
- 7 users (1 Vertical Head, 2 HODs: Suresh Menon & Kavita Reddy, 4 KAMs)
- 8 sample clients
- 8 inquiries
- 4 quotations
- 4 approvals
- 4 projects
- Sample history and notifications

## Step 4: Verify Installation

Run these verification queries:

```sql
-- Check all tables were created
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Check user hierarchy
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    h.name as hod_name
FROM users u
LEFT JOIN users h ON u.hod_id = h.id
ORDER BY u.role, u.name;

-- Expected output:
-- ID  Name            Email                    Role            HOD Name
-- 1   Vertical Head   vertical@parksons.com    Vertical Head   NULL
-- 2   Suresh Menon    suresh@parksons.com      H.O.D          NULL
-- 3   Kavita Reddy    kavita@parksons.com      H.O.D          NULL
-- 4   Rajesh Kumar    rajesh@parksons.com      KAM            Suresh Menon
-- 5   Amit Patel      amit@parksons.com        KAM            Suresh Menon
-- 6   Priya Sharma    priya@parksons.com       KAM            Kavita Reddy
-- 7   Sneha Gupta     sneha@parksons.com       KAM            Kavita Reddy

-- Check data distribution
SELECT
    'Inquiries' as entity,
    COUNT(*) as total,
    COUNT(DISTINCT kam_id) as unique_kams,
    COUNT(DISTINCT hod_id) as unique_hods
FROM inquiries
UNION ALL
SELECT
    'Quotations',
    COUNT(*),
    COUNT(DISTINCT kam_id),
    COUNT(DISTINCT hod_id)
FROM quotations
UNION ALL
SELECT
    'Clients',
    COUNT(*),
    COUNT(DISTINCT kam_id),
    COUNT(DISTINCT hod_id)
FROM clients;
```

## Step 5: Configure Environment Variables

Create `.env.local` in your project root:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=parkbuddy
DB_USER=sa
DB_PASSWORD=YourActualPassword

NODE_ENV=development
NEXTAUTH_SECRET=generate-a-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Important:**
- Replace `YourActualPassword` with your actual SQL Server password
- Never commit `.env.local` to git
- Add `.env.local` to your `.gitignore` file

## Login Credentials (Development Only)

After setup, you can login with these test accounts:

### Vertical Head
- Email: `vertical@parksons.com`
- Password: `vertical@123`
- Can see: All data

### HOD - Suresh Menon
- Email: `suresh@parksons.com`
- Password: `suresh@123`
- Can see: Own data + Rajesh Kumar + Amit Patel

### HOD - Kavita Reddy
- Email: `kavita@parksons.com`
- Password: `kavita@123`
- Can see: Own data + Priya Sharma + Sneha Gupta

### KAM - Rajesh Kumar (under Suresh)
- Email: `rajesh@parksons.com`
- Password: `rajesh@123`
- Can see: Only own data

### KAM - Amit Patel (under Suresh)
- Email: `amit@parksons.com`
- Password: `amit@123`
- Can see: Only own data

### KAM - Priya Sharma (under Kavita)
- Email: `priya@parksons.com`
- Password: `priya@123`
- Can see: Only own data

### KAM - Sneha Gupta (under Kavita)
- Email: `sneha@parksons.com`
- Password: `sneha@123`
- Can see: Only own data

## Next Steps

1. Install dependencies: `npm install mssql`
2. Create `lib/db.ts` connection utility (see MSSQL-CONNECTION-GUIDE.md)
3. Create API routes for authentication and data fetching
4. Update frontend components to use API endpoints
5. Test role-based access control with different user logins

## Troubleshooting

### "Cannot open database 'parkbuddy'"
- Make sure you created the database first
- Check you're connected to the right SQL Server instance

### "Login failed for user"
- Verify SQL Server authentication is enabled (mixed mode)
- Check username and password in `.env.local`
- Try Windows Authentication instead

### "TCP/IP connection refused"
- Enable TCP/IP in SQL Server Configuration Manager
- Check SQL Server Browser service is running
- Verify port 1433 is open in firewall

### Foreign Key Constraint Errors
- Make sure you run schema-mssql.sql BEFORE sample-data.sql
- The schema must exist before inserting data

## Database Schema Overview

```
users (7 records)
  ↓ hod_id references users(id)
  ├─ clients (8 records) - each linked to kam_id and hod_id
  ├─ inquiries (8 records) - each linked to client_id, kam_id, hod_id
  │   ↓ quotations (4 records) - references inquiry_id
  │       ↓ approvals (4 records) - references quotation_id
  │       └─ quotation_history (8 records) - tracks changes
  ├─ projects (4 records) - linked to client_id, kam_id, hod_id
  └─ notifications (4 records) - user notifications
```

All tables have proper indexes and foreign key constraints for data integrity.
