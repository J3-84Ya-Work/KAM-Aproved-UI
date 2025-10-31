-- KAM Approved UI - MS SQL Server Database Schema
-- Microsoft SQL Server compatible

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,  -- Plain text password for development
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('KAM', 'H.O.D', 'Vertical Head')),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Create indexes for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_hod_id ON users(hod_id);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 2. CLIENTS TABLE
-- =====================================================
CREATE TABLE clients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    industry NVARCHAR(100),
    contact_person NVARCHAR(255),
    email NVARCHAR(255),
    phone NVARCHAR(50),
    address NVARCHAR(MAX),
    city NVARCHAR(100),
    state NVARCHAR(100),
    postal_code NVARCHAR(20),
    country NVARCHAR(100) DEFAULT 'India',
    kam_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    status NVARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Prospect')),
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_clients_kam_id ON clients(kam_id);
CREATE INDEX idx_clients_hod_id ON clients(hod_id);
CREATE INDEX idx_clients_status ON clients(status);

-- =====================================================
-- 3. INQUIRIES TABLE
-- =====================================================
CREATE TABLE inquiries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    inquiry_id NVARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    kam_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    job_name NVARCHAR(255) NOT NULL,
    sku NVARCHAR(100),
    job_type NVARCHAR(100),
    quantity_range NVARCHAR(50),
    status NVARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Costing', 'Quoted', 'Approved', 'Rejected', 'Draft')),
    priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    clarification_status NVARCHAR(100),
    notes NVARCHAR(MAX),
    inquiry_date DATE NOT NULL,
    due_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_inquiries_kam_id ON inquiries(kam_id);
CREATE INDEX idx_inquiries_hod_id ON inquiries(hod_id);
CREATE INDEX idx_inquiries_client_id ON inquiries(client_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_inquiry_date ON inquiries(inquiry_date);

-- =====================================================
-- 4. QUOTATIONS TABLE
-- =====================================================
CREATE TABLE quotations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quotation_id NVARCHAR(50) UNIQUE NOT NULL,
    inquiry_id INT NULL FOREIGN KEY REFERENCES inquiries(id),
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    kam_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    job_name NVARCHAR(255) NOT NULL,
    sku NVARCHAR(100),
    quantity INT,
    unit_price DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    status NVARCHAR(50) DEFAULT 'Quoted' CHECK (status IN ('Quoted', 'Sent to HOD', 'Approved', 'Disapproved', 'Sent to Customer', 'Rejected')),
    priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes NVARCHAR(MAX),
    quotation_date DATE NOT NULL,
    valid_until DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_quotations_kam_id ON quotations(kam_id);
CREATE INDEX idx_quotations_hod_id ON quotations(hod_id);
CREATE INDEX idx_quotations_client_id ON quotations(client_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_inquiry_id ON quotations(inquiry_id);

-- =====================================================
-- 5. APPROVALS TABLE
-- =====================================================
CREATE TABLE approvals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    approval_id NVARCHAR(50) UNIQUE NOT NULL,
    quotation_id INT NULL FOREIGN KEY REFERENCES quotations(id),
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    kam_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    job_name NVARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2),
    approval_level NVARCHAR(10) CHECK (approval_level IN ('L1', 'L2')),
    status NVARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Disapproved')),
    approved_by INT NULL FOREIGN KEY REFERENCES users(id),
    approved_at DATETIME2,
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_approvals_kam_id ON approvals(kam_id);
CREATE INDEX idx_approvals_hod_id ON approvals(hod_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_quotation_id ON approvals(quotation_id);

-- =====================================================
-- 6. PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id NVARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    kam_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    hod_id INT NULL FOREIGN KEY REFERENCES users(id),
    project_name NVARCHAR(255) NOT NULL,
    project_type NVARCHAR(50) CHECK (project_type IN ('SDO', 'JDO', 'Commercial', 'PN')),
    status NVARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'On Hold', 'Cancelled')),
    start_date DATE,
    end_date DATE,
    delivery_date DATE,
    total_value DECIMAL(15, 2),
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_projects_kam_id ON projects(kam_id);
CREATE INDEX idx_projects_hod_id ON projects(hod_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_status ON projects(status);

-- =====================================================
-- 7. ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE activity_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    entity_type NVARCHAR(50) NOT NULL, -- 'inquiry', 'quotation', 'approval', 'project', 'client'
    entity_id INT NOT NULL,
    action NVARCHAR(50) NOT NULL, -- 'created', 'updated', 'approved', 'rejected', 'deleted'
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BIT DEFAULT 0,
    entity_type NVARCHAR(50),
    entity_id INT,
    created_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 9. QUOTATION HISTORY TABLE
-- =====================================================
CREATE TABLE quotation_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quotation_id INT NOT NULL FOREIGN KEY REFERENCES quotations(id),
    stage NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    changed_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_quotation_history_quotation_id ON quotation_history(quotation_id);
CREATE INDEX idx_quotation_history_created_at ON quotation_history(created_at);

-- =====================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create trigger for users table
GO
CREATE TRIGGER trg_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Create trigger for clients table
CREATE TRIGGER trg_clients_updated_at
ON clients
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE clients
    SET updated_at = GETDATE()
    FROM clients c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- Create trigger for inquiries table
CREATE TRIGGER trg_inquiries_updated_at
ON inquiries
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE inquiries
    SET updated_at = GETDATE()
    FROM inquiries inq
    INNER JOIN inserted i ON inq.id = i.id;
END;
GO

-- Create trigger for quotations table
CREATE TRIGGER trg_quotations_updated_at
ON quotations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE quotations
    SET updated_at = GETDATE()
    FROM quotations q
    INNER JOIN inserted i ON q.id = i.id;
END;
GO

-- Create trigger for approvals table
CREATE TRIGGER trg_approvals_updated_at
ON approvals
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE approvals
    SET updated_at = GETDATE()
    FROM approvals a
    INNER JOIN inserted i ON a.id = i.id;
END;
GO

-- Create trigger for projects table
CREATE TRIGGER trg_projects_updated_at
ON projects
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE projects
    SET updated_at = GETDATE()
    FROM projects p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO
