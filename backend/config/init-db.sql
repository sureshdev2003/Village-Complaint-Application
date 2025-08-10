-- Create database if not exists
CREATE DATABASE IF NOT EXISTS village_complaint_db;
USE village_complaint_db;

-- Users table (for public users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    address TEXT,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('union_office', 'collector_office', 'cm_office', 'super_admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    office_location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaint categories table
CREATE TABLE IF NOT EXISTS complaint_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT,
    category_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
    current_office ENUM('union_office', 'collector_office', 'cm_office') DEFAULT 'union_office',
    assigned_to INT NULL,
    images TEXT, -- JSON array of image URLs
    contact_name VARCHAR(100),
    contact_phone VARCHAR(15),
    contact_email VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Complaint status history table
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    old_status ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'rejected'),
    new_status ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'rejected') NOT NULL,
    changed_by INT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    admin_id INT,
    type ENUM('complaint_submitted', 'status_changed', 'assigned', 'resolved') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_complaint_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Insert default complaint categories
INSERT IGNORE INTO complaint_categories (name, description, icon_url) VALUES
('Road & Infrastructure', 'Report potholes, broken roads, or damaged public structures.', 'https://cdn-icons-png.flaticon.com/512/252/252035.png'),
('Water Supply Issues', 'Complaints about water leakage, muddy water, or no supply.', 'https://cdn-icons-png.flaticon.com/512/5786/5786379.png'),
('Electricity Problems', 'Report frequent power cuts, short circuits or broken poles.', 'https://cdn-icons-png.flaticon.com/512/1603/1603856.png'),
('Sanitation & Drainage', 'Overflowing drains, garbage dumps, or blocked sewer lines.', 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png'),
('Health & Hygiene', 'Report medical negligence, mosquito breeding or epidemics.', 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png'),
('Public Safety', 'Unsafe areas, street crimes, lack of police presence.', 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'),
('Education Facilities', 'Report missing teachers, school conditions or lack of materials.', 'https://cdn-icons-png.flaticon.com/512/3135/3135775.png'),
('Welfare Scheme Issues', 'Trouble accessing pensions, ration cards, or housing schemes.', 'https://cdn-icons-png.flaticon.com/512/847/847969.png'),
('Pollution & Environment', 'Illegal waste dumping, tree cutting, or air/water pollution.', 'https://cdn-icons-png.flaticon.com/512/2913/2913604.png'),
('Corruption or Misuse', 'Report bribes, fund misuses, or unresponsive officers.', 'https://cdn-icons-png.flaticon.com/512/753/753318.png'),
('Others', 'Any issues not listed under the defined categories.', 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png');

-- Insert default admin users (passwords should be hashed in real implementation)
INSERT IGNORE INTO admin_users (username, email, password, role, name, department, designation) VALUES
('union_admin', 'union@village.gov.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'union_office', 'Union Office Admin', 'Panchayat', 'Block Development Officer'),
('collector_admin', 'collector@district.gov.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'collector_office', 'Collector Office Admin', 'District Collectorate', 'Assistant Collector'),
('cm_admin', 'cm@state.gov.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cm_office', 'CM Office Admin', 'Chief Minister Office', 'Deputy Secretary'),
('super_admin', 'admin@village.gov.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'Super Admin', 'IT Department', 'System Administrator');

-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaint_status_history_complaint_id ON complaint_status_history(complaint_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_admin_id ON notifications(admin_id); 