# Database Setup Guide

This directory contains SQL scripts to set up the database for the KAM Approved UI application.

## Database Schema Overview

The database is designed to support **role-based access control** for three user types:
- **Vertical Head**: Can see all data
- **H.O.D (Head of Department)**: Can see data for themselves and their KAMs
- **KAM (Key Account Manager)**: Can only see their own data

## Files

1. **schema.sql** - Complete database schema with all tables and indexes
2. **sample-data.sql** - Sample data for testing and development
3. **README.md** - This file

## Supported Databases

The SQL scripts are compatible with:
- PostgreSQL (recommended)
- MySQL (with minor syntax adjustments)
- MariaDB

## Quick Start

### Option 1: PostgreSQL (Recommended)

```bash
# 1. Create database
createdb kam_approved_ui

# 2. Run schema
psql kam_approved_ui < schema.sql

# 3. Load sample data
psql kam_approved_ui < sample-data.sql
```

### Option 2: MySQL/MariaDB

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE kam_approved_ui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Run schema (adjust trigger syntax for MySQL)
mysql -u root -p kam_approved_ui < schema.sql

# 3. Load sample data
mysql -u root -p kam_approved_ui < sample-data.sql
```

## Database Tables

### Core Tables

1. **users** - Stores user accounts (KAMs, HODs, Vertical Head)
2. **clients** - Customer/client information
3. **inquiries** - Customer inquiries
4. **quotations** - Price quotations for inquiries
5. **approvals** - Approval workflow for quotations
6. **projects** - Active projects (SDO, JDO, Commercial, PN)

### Supporting Tables

7. **activity_log** - Audit trail of all user actions
8. **notifications** - In-app notifications for users
9. **quotation_history** - Status change history for quotations

## User Hierarchy

```
Vertical Head
├── Suresh Menon (HOD)
│   ├── Rajesh Kumar (KAM)
│   └── Amit Patel (KAM)
└── Kavita Reddy (HOD)
    ├── Priya Sharma (KAM)
    └── Sneha Gupta (KAM)
```

## Sample User Credentials (Development Only)

| Email | Password | Name | Role |
|-------|----------|------|------|
| vertical@parksons.com | vertical@123 | Vertical Head | Vertical Head |
| suresh@parksons.com | suresh@123 | Suresh Menon | H.O.D |
| kavita@parksons.com | kavita@123 | Kavita Reddy | H.O.D |
| rajesh@parksons.com | rajesh@123 | Rajesh Kumar | KAM |
| amit@parksons.com | amit@123 | Amit Patel | KAM |
| priya@parksons.com | priya@123 | Priya Sharma | KAM |
| sneha@parksons.com | sneha@123 | Sneha Gupta | KAM |

**⚠️ IMPORTANT**: These are sample passwords for development. In production, use proper password hashing with bcrypt or argon2.

## Data Access Rules

### Vertical Head
- Can view **ALL** data across all tables
- No filtering applied

### H.O.D (Head of Department)
- Can view their own data
- Can view data of all KAMs reporting to them
- Filter: `WHERE hod_id = :current_user_id OR kam_id IN (SELECT id FROM users WHERE hod_id = :current_user_id)`

### KAM (Key Account Manager)
- Can view **ONLY** their own data
- Filter: `WHERE kam_id = :current_user_id`

## Example Queries

### Get inquiries for current user (HOD)
```sql
-- For Suresh Menon (user_id = 2)
SELECT i.*
FROM inquiries i
WHERE i.hod_id = 2 OR i.kam_id IN (
    SELECT id FROM users WHERE hod_id = 2
);
```

### Get inquiries for current user (KAM)
```sql
-- For Rajesh Kumar (user_id = 4)
SELECT i.*
FROM inquiries i
WHERE i.kam_id = 4;
```

### Get all clients for a HOD
```sql
-- For Kavita Reddy (user_id = 3)
SELECT c.*
FROM clients c
WHERE c.hod_id = 3;
```

## Environment Variables

Add these to your `.env` file:

```env
# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/kam_approved_ui

# Or MySQL
DATABASE_URL=mysql://username:password@localhost:3306/kam_approved_ui
```

## Next.js Integration

### Install Prisma (Recommended)

```bash
npm install @prisma/client
npm install -D prisma
```

### Initialize Prisma

```bash
npx prisma init
```

### Or use a direct database client

```bash
# PostgreSQL
npm install pg

# MySQL
npm install mysql2
```

## Indexes

The schema includes optimized indexes for:
- User role and HOD lookups
- KAM/HOD filtering on all main tables
- Status and date-based queries
- Fast joins between related tables

## Security Considerations

1. **Password Hashing**: Always use bcrypt or argon2 for password storage
2. **SQL Injection**: Use parameterized queries or an ORM (Prisma recommended)
3. **Role Validation**: Always verify user role server-side before data access
4. **Audit Trail**: Use the activity_log table to track all data modifications
5. **Data Isolation**: Implement row-level security for multi-tenant scenarios

## Migration Strategy

For production deployments:

1. Use database migration tools (Prisma Migrate, Flyway, or Liquibase)
2. Version control all schema changes
3. Test migrations on staging before production
4. Keep rollback scripts ready

## Backup Strategy

```bash
# PostgreSQL backup
pg_dump kam_approved_ui > backup_$(date +%Y%m%d).sql

# MySQL backup
mysqldump kam_approved_ui > backup_$(date +%Y%m%d).sql
```

## Support

For questions or issues with the database schema, please refer to the main project documentation.
