# MS SQL Server Connection Guide for Next.js

This guide will help you connect your Next.js application to MS SQL Server and replace the hardcoded data with database queries.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Install Dependencies](#install-dependencies)
4. [Environment Configuration](#environment-configuration)
5. [Database Connection Utility](#database-connection-utility)
6. [API Routes Implementation](#api-routes-implementation)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)

---

## Prerequisites

- MS SQL Server installed (Express, Developer, or Enterprise Edition)
- SQL Server Management Studio (SSMS) or Azure Data Studio
- Node.js 18+ installed
- This Next.js application running

---

## Database Setup

### Step 1: Create Database

Open SQL Server Management Studio and run:

```sql
CREATE DATABASE parkbuddy;
GO

USE parkbuddy;
GO
```

### Step 2: Run Schema Script

1. Open `database/schema-mssql.sql`
2. Execute the entire script in SSMS
3. Verify all tables were created:

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

You should see 9 tables:
- activity_log
- approvals
- clients
- inquiries
- notifications
- projects
- quotation_history
- quotations
- users

### Step 3: Insert Sample Data

1. Open `database/sample-data.sql`
2. **IMPORTANT**: Before running, update passwords:

```sql
-- Generate proper bcrypt hashes for production
-- For development, you can use these sample hashes temporarily
```

3. Execute the script to populate tables with sample data

### Step 4: Verify Data

```sql
-- Check users
SELECT id, name, email, role FROM users;

-- Check clients
SELECT id, customer_id, name, kam_id, hod_id FROM clients;

-- Check inquiries
SELECT id, inquiry_id, job_name, status FROM inquiries;
```

---

## Install Dependencies

Install the MS SQL Server client for Node.js:

```bash
npm install mssql
npm install --save-dev @types/mssql
```

For password hashing (production):

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

---

## Environment Configuration

Create `.env.local` in the project root:

```env
# MS SQL Server Connection
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=parkbuddy
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!

# For Windows Authentication, use:
# DB_TRUSTED_CONNECTION=true

# For Azure SQL Database, use:
# DB_SERVER=your-server.database.windows.net
# DB_ENCRYPT=true

# App Configuration
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-generate-a-random-string
NEXTAUTH_URL=http://localhost:3000
```

**Security Note**:
- Never commit `.env.local` to git
- Add `.env.local` to `.gitignore`
- Use strong passwords for production

---

## Database Connection Utility

Create `lib/db.ts`:

```typescript
import sql from 'mssql'

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'parkbuddy',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure
    trustServerCertificate: process.env.NODE_ENV === 'development', // Use true for local dev
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config)
    console.log('✅ Connected to MS SQL Server')
  }
  return pool
}

export async function executeQuery<T>(
  query: string,
  params?: { [key: string]: any }
): Promise<T[]> {
  try {
    const pool = await getConnection()
    const request = pool.request()

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value)
      })
    }

    const result = await request.query(query)
    return result.recordset as T[]
  } catch (error) {
    console.error('❌ Database query error:', error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('🔌 Disconnected from MS SQL Server')
  }
}

// Export sql types for use in API routes
export { sql }
```

---

## API Routes Implementation

### Authentication API

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcryptjs'

interface User {
  id: number
  email: string
  password_hash: string
  password: string  // Plain text password
  name: string
  role: string
  hod_id: number | null
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Query user from database
    const users = await executeQuery<User>(
      `SELECT id, email, password_hash, password, name, role, hod_id
       FROM users
       WHERE email = @email AND is_active = 1`,
      { email }
    )

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verify password
    // For development: use plain text password field
    // For production: use bcrypt with password_hash field
    const isValidPassword =
      process.env.NODE_ENV === 'development'
        ? password === user.password
        : await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data (excluding password)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hod_id: user.hod_id,
      loggedInAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Inquiries API

Create `app/api/inquiries/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, sql } from '@/lib/db'

interface Inquiry {
  id: number
  inquiry_id: string
  client_id: number
  kam_id: number
  hod_id: number | null
  job_name: string
  sku: string
  job_type: string
  quantity_range: string
  status: string
  priority: string
  clarification_status: string
  notes: string
  inquiry_date: string
  due_date: string
  created_at: string
  updated_at: string
  client_name?: string
  kam_name?: string
  hod_name?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'userId and userRole are required' },
        { status: 400 }
      )
    }

    let query = `
      SELECT
        i.*,
        c.name as client_name,
        u_kam.name as kam_name,
        u_hod.name as hod_name
      FROM inquiries i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN users u_kam ON i.kam_id = u_kam.id
      LEFT JOIN users u_hod ON i.hod_id = u_hod.id
    `

    // Role-based filtering
    if (userRole === 'KAM') {
      query += ` WHERE i.kam_id = @userId`
    } else if (userRole === 'H.O.D') {
      // HOD sees their own data and their KAMs' data
      query += `
        WHERE i.kam_id IN (
          SELECT id FROM users WHERE hod_id = @userId
        ) OR i.hod_id = @userId
      `
    }
    // Vertical Head sees all data (no WHERE clause)

    query += ` ORDER BY i.inquiry_date DESC`

    const inquiries = await executeQuery<Inquiry>(query, { userId: parseInt(userId) })

    return NextResponse.json(inquiries)
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const result = await executeQuery(
      `INSERT INTO inquiries
       (inquiry_id, client_id, kam_id, hod_id, job_name, sku, job_type,
        quantity_range, status, priority, clarification_status, notes,
        inquiry_date, due_date)
       OUTPUT INSERTED.*
       VALUES
       (@inquiry_id, @client_id, @kam_id, @hod_id, @job_name, @sku, @job_type,
        @quantity_range, @status, @priority, @clarification_status, @notes,
        @inquiry_date, @due_date)`,
      data
    )

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    )
  }
}
```

### Similar API Routes Needed

Create the following API routes following the same pattern:

- `app/api/quotations/route.ts`
- `app/api/approvals/route.ts`
- `app/api/projects/route.ts`
- `app/api/clients/route.ts`

Each should implement:
- `GET` - with role-based filtering
- `POST` - for creating new records
- `PUT` - for updating records (create `[id]/route.ts`)
- `DELETE` - for deleting records (create `[id]/route.ts`)

---

## Frontend Integration

### Update Login Page

Modify `app/login/page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Login failed')
      setIsLoading(false)
      return
    }

    // Store auth data
    localStorage.setItem("userAuth", JSON.stringify(data))
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        company: "Parksons",
      })
    )

    // Dispatch event
    window.dispatchEvent(new Event("profileUpdated"))

    // Redirect based on role
    setTimeout(() => {
      if (data.role === "KAM") {
        router.push("/")
      } else {
        router.push("/dashboard")
      }
    }, 500)
  } catch (error) {
    console.error('Login error:', error)
    setError('An error occurred during login')
    setIsLoading(false)
  }
}
```

### Update Data Fetching in Components

Example for `components/inquiries-content.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { getViewableKAMs } from "@/lib/permissions"

export function InquiriesContent() {
  const [inquiries, setInquiries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      setIsLoading(true)

      // Get user from localStorage
      const userAuth = localStorage.getItem("userAuth")
      if (!userAuth) {
        setError("Not authenticated")
        return
      }

      const user = JSON.parse(userAuth)

      // Fetch from API
      const response = await fetch(
        `/api/inquiries?userId=${user.id}&userRole=${encodeURIComponent(user.role)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries')
      }

      const data = await response.json()
      setInquiries(data)
    } catch (err) {
      console.error('Error fetching inquiries:', err)
      setError('Failed to load inquiries')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading inquiries...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // Rest of component...
}
```

---

## Testing

### 1. Test Database Connection

Create `scripts/test-connection.js`:

```javascript
const sql = require('mssql')
require('dotenv').config({ path: '.env.local' })

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MS SQL Server...')
    console.log('Config:', { ...config, password: '***' })

    const pool = await sql.connect(config)
    console.log('✅ Connected successfully!')

    const result = await pool.request().query('SELECT @@VERSION as version')
    console.log('SQL Server Version:', result.recordset[0].version)

    const tables = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `)
    console.log('Tables found:', tables.recordset.length)
    tables.recordset.forEach(t => console.log('  -', t.TABLE_NAME))

    await pool.close()
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

testConnection()
```

Run it:

```bash
node scripts/test-connection.js
```

### 2. Test Login API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@parksons.com","password":"rajesh@123"}'
```

### 3. Test Inquiries API

```bash
# Replace with actual user ID after login
curl "http://localhost:3000/api/inquiries?userId=4&userRole=KAM"
```

### 4. Test Role-Based Access

- Login as KAM (rajesh@parksons.com) - should only see their inquiries
- Login as HOD (suresh@parksons.com) - should see Rajesh's and Amit's inquiries
- Login as Vertical Head - should see all inquiries

---

## Security Best Practices

### 1. Use Environment Variables

Never hardcode database credentials in code.

### 2. Implement Proper Password Hashing

Update sample data with bcrypt hashes:

```javascript
const bcrypt = require('bcryptjs')
const password = 'rajesh@123'
const hash = bcrypt.hashSync(password, 10)
console.log(hash)
```

### 3. Add Input Validation

Use libraries like `zod` for schema validation:

```bash
npm install zod
```

### 4. Implement Rate Limiting

Protect login endpoint from brute force attacks.

### 5. Use HTTPS in Production

Always use SSL/TLS for database connections in production.

### 6. SQL Injection Prevention

Always use parameterized queries (which we're doing with `@param` syntax).

---

## Troubleshooting

### Connection Refused

- Check SQL Server is running
- Verify TCP/IP is enabled in SQL Server Configuration Manager
- Check firewall allows port 1433

### Authentication Failed

- Verify SQL Server authentication mode (mixed mode required for SQL auth)
- Check username and password are correct
- Try Windows Authentication if on same machine

### Cannot Find Database

- Verify database name is correct
- Run `SELECT name FROM sys.databases` to list all databases

---

## Next Steps

1. ✅ Set up MS SQL Server database
2. ✅ Run schema and sample data scripts
3. ⬜ Install npm dependencies
4. ⬜ Configure environment variables
5. ⬜ Test database connection
6. ⬜ Implement API routes for all entities
7. ⬜ Update frontend components to fetch from API
8. ⬜ Test role-based access control
9. ⬜ Deploy to production

---

## Additional Resources

- [MS SQL Server Documentation](https://docs.microsoft.com/en-us/sql/)
- [node-mssql Documentation](https://www.npmjs.com/package/mssql)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
