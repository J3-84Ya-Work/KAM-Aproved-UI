-- =====================================================
-- ALTER TABLE to add plain text password column
-- Run this if you already created the users table
-- =====================================================

USE parkbuddy;
GO

-- Add password column to users table
ALTER TABLE users
ADD password NVARCHAR(255) NULL;
GO

-- Update existing users with plain text passwords
UPDATE users SET password = 'vertical@123' WHERE email = 'vertical@parksons.com';
UPDATE users SET password = 'suresh@123' WHERE email = 'suresh@parksons.com';
UPDATE users SET password = 'kavita@123' WHERE email = 'kavita@parksons.com';
UPDATE users SET password = 'rajesh@123' WHERE email = 'rajesh@parksons.com';
UPDATE users SET password = 'amit@123' WHERE email = 'amit@parksons.com';
UPDATE users SET password = 'priya@123' WHERE email = 'priya@parksons.com';
UPDATE users SET password = 'sneha@123' WHERE email = 'sneha@parksons.com';
GO

-- Make password column NOT NULL after populating data
ALTER TABLE users
ALTER COLUMN password NVARCHAR(255) NOT NULL;
GO

-- Verify the changes
SELECT id, email, password, name, role FROM users;
GO

PRINT 'Password column added and populated successfully!';
GO
