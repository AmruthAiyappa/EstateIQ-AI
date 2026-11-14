-- Schema for EstateIQ AI Database

-- Drop tables if they exist
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS properties;

-- Properties Table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    property_name VARCHAR(255) NOT NULL,
    developer VARCHAR(100) NOT NULL,
    community VARCHAR(100) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    sqft INT NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    roi NUMERIC(5, 2) NOT NULL, -- e.g. 8.5%
    rental_yield NUMERIC(5, 2) NOT NULL, -- e.g. 7.2%
    future_appreciation NUMERIC(5, 2) NOT NULL, -- e.g. 6.0%
    developer_rating NUMERIC(3, 1) NOT NULL, -- e.g. 9.2 / 10
    liquidity NUMERIC(5, 2) NOT NULL, -- e.g. 85.0
    risk VARCHAR(20) NOT NULL, -- Low, Medium, High
    demand NUMERIC(5, 2) NOT NULL, -- e.g. 90.0
    metro_distance NUMERIC(4, 2) NOT NULL, -- distance in km
    school_distance NUMERIC(4, 2) NOT NULL, -- distance in km
    hospital_distance NUMERIC(4, 2) NOT NULL, -- distance in km
    mall_distance NUMERIC(4, 2) NOT NULL, -- distance in km
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    description TEXT,
    image_url VARCHAR(500)
);

-- Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    budget NUMERIC(15, 2) NOT NULL,
    requirements TEXT,
    interested_properties TEXT, -- comma-separated property IDs
    meeting_notes TEXT,
    follow_up_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active' -- Active, Inactive, Closed
);

-- Leads / Deal Pipeline Table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    budget NUMERIC(15, 2) NOT NULL,
    property_id INT REFERENCES properties(id) ON DELETE SET NULL,
    value NUMERIC(15, 2) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'New Lead', -- New Lead, Contacted, Meeting Scheduled, Negotiation, Closed, Lost
    last_contact VARCHAR(50),
    next_action VARCHAR(255)
);
