// Test MS SQL Server Database Connection
// Run this with: node test-db-connection.js

const sql = require('mssql')
require('dotenv').config({ path: '.env.local' })

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE || 'parkbuddy',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure
    trustServerCertificate: true, // Use true for local dev
    enableArithAbort: true,
  },
}

console.log('\n========================================')
console.log('🔌 MS SQL SERVER CONNECTION TEST')
console.log('========================================\n')

console.log('📋 Configuration:')
console.log(`   Server: ${config.server}`)
console.log(`   Port: ${config.port}`)
console.log(`   Database: ${config.database}`)
console.log(`   User: ${config.user}`)
console.log(`   Password: ${'*'.repeat(config.password?.length || 0)}`)
console.log(`   Encrypt: ${config.options.encrypt}`)
console.log(`   Trust Certificate: ${config.options.trustServerCertificate}\n`)

async function testConnection() {
  let pool = null

  try {
    console.log('⏳ Attempting to connect to MS SQL Server...\n')

    // Connect to database
    pool = await sql.connect(config)
    console.log('✅ CONNECTION SUCCESSFUL!\n')

    // Get SQL Server version
    console.log('📊 Server Information:')
    const versionResult = await pool.request().query('SELECT @@VERSION as version')
    const version = versionResult.recordset[0].version
    console.log(`   ${version.split('\n')[0]}\n`)

    // Get database name
    const dbResult = await pool.request().query('SELECT DB_NAME() as dbname')
    console.log(`   Current Database: ${dbResult.recordset[0].dbname}\n`)

    // List all tables
    console.log('📁 Tables in database:')
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)

    if (tablesResult.recordset.length === 0) {
      console.log('   ⚠️  No tables found. Run schema-mssql.sql first.\n')
    } else {
      console.log(`   Found ${tablesResult.recordset.length} tables:`)
      tablesResult.recordset.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.TABLE_NAME}`)
      })
      console.log('')
    }

    // Check users table
    const userCheckResult = await pool.request().query(`
      SELECT COUNT(*) as table_exists
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'users'
    `)

    if (userCheckResult.recordset[0].table_exists > 0) {
      console.log('👥 Users Table:')

      // Check if password column exists
      const passwordColResult = await pool.request().query(`
        SELECT COUNT(*) as col_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'password'
      `)

      const hasPasswordColumn = passwordColResult.recordset[0].col_exists > 0
      console.log(`   Password column exists: ${hasPasswordColumn ? '✅ Yes' : '❌ No (run ALTER-add-password-column.sql)'}`)

      // Get user count
      const userCountResult = await pool.request().query('SELECT COUNT(*) as user_count FROM users')
      const userCount = userCountResult.recordset[0].user_count
      console.log(`   Total users: ${userCount}`)

      if (userCount > 0) {
        // Show user details
        const usersResult = await pool.request().query(`
          SELECT
            id,
            email,
            name,
            role,
            ${hasPasswordColumn ? 'password,' : ''}
            CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
          FROM users
          ORDER BY
            CASE role
              WHEN 'Vertical Head' THEN 1
              WHEN 'H.O.D' THEN 2
              WHEN 'KAM' THEN 3
            END,
            name
        `)

        console.log('\n   User Details:')
        console.log('   ' + '-'.repeat(100))
        usersResult.recordset.forEach(user => {
          const passwordDisplay = hasPasswordColumn ? ` | Password: ${user.password}` : ''
          console.log(`   ID: ${user.id} | ${user.email.padEnd(25)} | ${user.name.padEnd(20)} | ${user.role.padEnd(15)} | ${user.status}${passwordDisplay}`)
        })
        console.log('   ' + '-'.repeat(100))
      } else {
        console.log('   ⚠️  No users found. Run sample-data.sql to insert test data.')
      }
      console.log('')
    } else {
      console.log('⚠️  Users table not found. Run schema-mssql.sql first.\n')
    }

    // Test a sample query
    console.log('🔍 Testing Sample Query:')
    const testQueryResult = await pool.request()
      .input('email', sql.NVarChar, 'rajesh@parksons.com')
      .query('SELECT TOP 1 id, email, name, role FROM users WHERE email = @email')

    if (testQueryResult.recordset.length > 0) {
      console.log('   ✅ Query successful!')
      console.log(`   Found user: ${testQueryResult.recordset[0].name} (${testQueryResult.recordset[0].role})`)
    } else {
      console.log('   ℹ️  No user found with email: rajesh@parksons.com')
    }

    console.log('\n========================================')
    console.log('✅ ALL TESTS PASSED!')
    console.log('========================================\n')

    console.log('💡 Next Steps:')
    if (tablesResult.recordset.length === 0) {
      console.log('   1. Run schema-mssql.sql to create tables')
      console.log('   2. Run sample-data.sql to insert test data')
    } else if (userCountResult?.recordset[0]?.user_count === 0) {
      console.log('   1. Run sample-data.sql to insert test data')
    } else if (!hasPasswordColumn) {
      console.log('   1. Run ALTER-add-password-column.sql to add password column')
    } else {
      console.log('   ✅ Database is ready!')
      console.log('   1. Install mssql package: npm install mssql')
      console.log('   2. Create lib/db.ts connection utility')
      console.log('   3. Create API routes for authentication')
    }
    console.log('')

  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n')
    console.error('Error Details:')
    console.error(`   Message: ${error.message}`)

    if (error.code) {
      console.error(`   Code: ${error.code}`)
    }

    console.error('\n💡 Troubleshooting:')

    if (error.code === 'ESOCKET' || error.message.includes('timeout')) {
      console.error('   • Check if SQL Server is running')
      console.error('   • Verify server address and port are correct')
      console.error('   • Check firewall settings (port 1433 should be open)')
      console.error('   • Ensure TCP/IP is enabled in SQL Server Configuration Manager')
    } else if (error.code === 'ELOGIN' || error.message.includes('Login failed')) {
      console.error('   • Verify username and password are correct')
      console.error('   • Check if SQL Server authentication is enabled (mixed mode)')
      console.error('   • Ensure the user has access to the database')
    } else if (error.message.includes('Cannot open database')) {
      console.error('   • Database "parkbuddy" does not exist')
      console.error('   • Create it with: CREATE DATABASE parkbuddy;')
    } else {
      console.error('   • Check .env.local file exists and has correct values')
      console.error('   • Verify SQL Server is accessible from this machine')
    }

    console.error('\n📋 Connection String Used:')
    console.error(`   Server=${config.server},${config.port};Database=${config.database};User Id=${config.user}`)
    console.error('')

    process.exit(1)
  } finally {
    // Close connection
    if (pool) {
      await pool.close()
      console.log('🔌 Connection closed.\n')
    }
  }
}

// Run the test
testConnection()
