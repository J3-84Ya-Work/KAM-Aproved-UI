-- KAM Approved UI - Sample Data Insertion Script
-- Run this after schema.sql

-- =====================================================
-- 1. INSERT USERS (HODs, KAMs, Vertical Head)
-- =====================================================

-- Note: Passwords are stored in both hashed and plain text format
-- password_hash: For future production use with bcrypt
-- password: Plain text for development/testing

-- Insert Vertical Head
INSERT INTO users (email, password_hash, password, name, role, hod_id) VALUES
('vertical@parksons.com', '$2a$10$samplehashforvertical', 'vertical@123', 'Vertical Head', 'Vertical Head', NULL);

-- Insert HODs
INSERT INTO users (email, password_hash, password, name, role, hod_id) VALUES
('suresh@parksons.com', '$2a$10$samplehashforsuresh', 'suresh@123', 'Suresh Menon', 'H.O.D', NULL),
('kavita@parksons.com', '$2a$10$samplehashforkavita', 'kavita@123', 'Kavita Reddy', 'H.O.D', NULL);

-- Insert KAMs under Suresh Menon (HOD ID = 2)
INSERT INTO users (email, password_hash, password, name, role, hod_id) VALUES
('rajesh@parksons.com', '$2a$10$samplehashforrajesh', 'rajesh@123', 'Rajesh Kumar', 'KAM', 2),
('amit@parksons.com', '$2a$10$samplehashforamit', 'amit@123', 'Amit Patel', 'KAM', 2);

-- Insert KAMs under Kavita Reddy (HOD ID = 3)
INSERT INTO users (email, password_hash, password, name, role, hod_id) VALUES
('priya@parksons.com', '$2a$10$samplehashforpriya', 'priya@123', 'Priya Sharma', 'KAM', 3),
('sneha@parksons.com', '$2a$10$samplehashforsneha', 'sneha@123', 'Sneha Gupta', 'KAM', 3);

-- =====================================================
-- 2. INSERT SAMPLE CLIENTS
-- =====================================================

INSERT INTO clients (customer_id, name, industry, contact_person, email, phone, city, state, kam_id, hod_id, status, total_orders, total_revenue) VALUES
('CUST-001', 'Tata Industries', 'Manufacturing', 'Ratan Tata', 'contact@tata.com', '+91-9876543210', 'Mumbai', 'Maharashtra', 4, 2, 'Active', 25, 2500000.00),
('CUST-002', 'Reliance Retail', 'Retail', 'Mukesh Ambani', 'retail@reliance.com', '+91-9876543211', 'Mumbai', 'Maharashtra', 6, 3, 'Active', 18, 1800000.00),
('CUST-003', 'Mahindra Logistics', 'Logistics', 'Anand Mahindra', 'logistics@mahindra.com', '+91-9876543212', 'Mumbai', 'Maharashtra', 5, 2, 'Active', 12, 1200000.00),
('CUST-004', 'Wipro Technologies', 'IT Services', 'Azim Premji', 'contact@wipro.com', '+91-9876543213', 'Bangalore', 'Karnataka', 4, 2, 'Active', 15, 1500000.00),
('CUST-005', 'Infosys Ltd', 'IT Services', 'Narayana Murthy', 'info@infosys.com', '+91-9876543214', 'Bangalore', 'Karnataka', 7, 3, 'Active', 20, 2000000.00),
('CUST-006', 'Aditya Birla Group', 'Conglomerate', 'Kumar Birla', 'contact@adityabirla.com', '+91-9876543215', 'Mumbai', 'Maharashtra', 6, 3, 'Active', 22, 2200000.00),
('CUST-007', 'Asian Paints Ltd', 'Manufacturing', 'Manish Choksi', 'sales@asianpaints.com', '+91-9876543216', 'Mumbai', 'Maharashtra', 5, 2, 'Active', 30, 3000000.00),
('CUST-008', 'Godrej Industries', 'Conglomerate', 'Adi Godrej', 'contact@godrej.com', '+91-9876543217', 'Mumbai', 'Maharashtra', 7, 3, 'Active', 28, 2800000.00);

-- =====================================================
-- 3. INSERT SAMPLE INQUIRIES
-- =====================================================

INSERT INTO inquiries (inquiry_id, client_id, kam_id, hod_id, job_name, sku, job_type, quantity_range, status, priority, clarification_status, notes, inquiry_date, due_date) VALUES
('INQ-2024-001', 1, 4, 2, 'Custom Packaging Box', 'PKG-001', 'Monocarton', '5000-10000', 'Costing', 'high', 'Pending Clarification', 'Urgent requirement for Q1 launch', '2024-01-15', '2024-01-18'),
('INQ-2024-002', 2, 6, 3, 'Printed Labels', 'LBL-045', 'Fluted Box', '10000-15000', 'Quoted', 'medium', 'Clarified', 'Repeat order with minor modifications', '2024-01-14', '2024-01-20'),
('INQ-2024-003', 3, 5, 2, 'Corrugated Sheets', 'COR-023', 'Rigid Box', '2000-5000', 'Pending', 'low', 'Awaiting Customer', 'New customer inquiry', '2024-01-13', '2024-01-25'),
('INQ-2024-004', 4, 4, 2, 'Folding Cartons', 'FLD-012', 'Gable Top', '8000-12000', 'Approved', 'high', 'Not Required', 'Ready for quotation', '2024-01-12', '2024-01-17'),
('INQ-2024-005', 5, 7, 3, 'Die-Cut Boxes', 'DCB-089', 'Paper Pod', '3000-6000', 'Pending', 'medium', 'Pending Clarification', 'Awaiting customer specifications', '2024-01-11', '2024-01-22'),
('INQ-2024-006', 6, 6, 3, 'Luxury Gift Hampers', 'LGH-034', 'Burgo Pack', '1500-3000', 'Costing', 'medium', 'Awaiting Customer', 'Need final artwork approval', '2024-01-10', '2024-01-19'),
('INQ-2024-007', 7, 5, 2, 'Premium Tea Boxes', 'PTB-210', 'Speciality Pack', '4000-7000', 'Quoted', 'high', 'Clarified', 'All specs confirmed, awaiting PO', '2024-01-09', '2024-01-21'),
('INQ-2024-008', 8, 7, 3, 'Pharmaceutical Cartons', 'PHC-156', 'Monocarton', '12000-18000', 'Costing', 'high', 'Clarified', 'Priority pharma packaging order', '2024-01-08', '2024-01-15');

-- =====================================================
-- 4. INSERT SAMPLE QUOTATIONS
-- =====================================================

INSERT INTO quotations (quotation_id, inquiry_id, client_id, kam_id, hod_id, job_name, sku, quantity, unit_price, total_price, status, priority, notes, quotation_date, valid_until) VALUES
('QUO-2024-001', 1, 1, 4, 2, 'Custom Packaging Box', 'PKG-001', 7500, 45.50, 341250.00, 'Sent to HOD', 'high', 'Awaiting HOD approval', '2024-01-16', '2024-02-16'),
('QUO-2024-002', 2, 2, 6, 3, 'Printed Labels', 'LBL-045', 12500, 12.75, 159375.00, 'Approved', 'medium', 'Approved by HOD, sent to customer', '2024-01-15', '2024-02-15'),
('QUO-2024-003', 4, 4, 4, 2, 'Folding Cartons', 'FLD-012', 10000, 22.50, 225000.00, 'Sent to Customer', 'high', 'Customer reviewing quotation', '2024-01-13', '2024-02-13'),
('QUO-2024-004', 7, 7, 5, 2, 'Premium Tea Boxes', 'PTB-210', 5500, 65.00, 357500.00, 'Quoted', 'high', 'Premium quality tea packaging', '2024-01-10', '2024-02-10');

-- =====================================================
-- 5. INSERT SAMPLE APPROVALS
-- =====================================================

INSERT INTO approvals (approval_id, quotation_id, client_id, kam_id, hod_id, job_name, amount, approval_level, status, notes) VALUES
('APR-2024-001', 1, 1, 4, 2, 'Custom Packaging Box', 341250.00, 'L1', 'Pending', 'Awaiting L1 approval from HOD'),
('APR-2024-002', 2, 2, 6, 3, 'Printed Labels', 159375.00, 'L1', 'Approved', 'Approved by Kavita Reddy'),
('APR-2024-003', 3, 4, 4, 2, 'Folding Cartons', 225000.00, 'L1', 'Approved', 'Approved by Suresh Menon'),
('APR-2024-004', 4, 7, 5, 2, 'Premium Tea Boxes', 357500.00, 'L1', 'Pending', 'High value order, pending HOD review');

-- =====================================================
-- 6. INSERT SAMPLE PROJECTS
-- =====================================================

INSERT INTO projects (project_id, client_id, kam_id, hod_id, project_name, project_type, status, start_date, end_date, total_value, progress_percentage) VALUES
('PRJ-SDO-001', 1, 4, 2, 'Tata Custom Packaging Production', 'SDO', 'In Progress', '2024-01-20', '2024-03-20', 500000.00, 45),
('PRJ-JDO-001', 4, 4, 2, 'Wipro Folding Cartons Job', 'JDO', 'In Progress', '2024-01-18', '2024-02-28', 225000.00, 65),
('PRJ-COM-001', 2, 6, 3, 'Reliance Retail Labels Order', 'Commercial', 'Completed', '2024-01-10', '2024-01-31', 159375.00, 100),
('PRJ-PN-001', 7, 5, 2, 'Asian Paints Premium Boxes', 'PN', 'In Progress', '2024-01-15', '2024-02-15', 357500.00, 30);

-- =====================================================
-- 7. INSERT SAMPLE QUOTATION HISTORY
-- =====================================================

INSERT INTO quotation_history (quotation_id, stage, status, changed_by, notes) VALUES
(1, 'Created', 'Quoted', 4, 'Initial quotation created'),
(1, 'Submitted', 'Sent to HOD', 4, 'Submitted for HOD approval'),
(2, 'Created', 'Quoted', 6, 'Initial quotation created'),
(2, 'Approved', 'Approved', 3, 'Approved by Kavita Reddy'),
(2, 'Sent', 'Sent to Customer', 6, 'Quotation sent to customer'),
(3, 'Created', 'Quoted', 4, 'Initial quotation created'),
(3, 'Approved', 'Approved', 2, 'Approved by Suresh Menon'),
(3, 'Sent', 'Sent to Customer', 4, 'Quotation sent to customer');

-- =====================================================
-- 8. INSERT SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, title, message, type, is_read, entity_type, entity_id) VALUES
(2, 'New Approval Request', 'Quotation QUO-2024-001 requires your approval', 'warning', 0, 'quotation', 1),
(4, 'Quotation Approved', 'Your quotation QUO-2024-003 has been approved', 'success', 0, 'quotation', 3),
(6, 'New Inquiry', 'New inquiry received from Reliance Retail', 'info', 1, 'inquiry', 2),
(5, 'Project Milestone', 'Project PRJ-PN-001 has reached 30% completion', 'info', 0, 'project', 4);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify user hierarchy
-- SELECT u.name, u.role, h.name as hod_name
-- FROM users u
-- LEFT JOIN users h ON u.hod_id = h.id;

-- Verify client distribution
-- SELECT c.name, u.name as kam_name, h.name as hod_name
-- FROM clients c
-- JOIN users u ON c.kam_id = u.id
-- LEFT JOIN users h ON c.hod_id = h.id;

-- Verify inquiry distribution
-- SELECT i.inquiry_id, c.name as client, u.name as kam, h.name as hod
-- FROM inquiries i
-- JOIN clients c ON i.client_id = c.id
-- JOIN users u ON i.kam_id = u.id
-- LEFT JOIN users h ON i.hod_id = h.id;
