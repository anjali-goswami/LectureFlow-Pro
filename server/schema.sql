-- PostgreSQL Schema for Lecture Hall Assignment & Break Management System

-- Drop tables if needed (careful in production)
-- DROP TABLE IF EXISTS schedules CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS lecture_halls CASCADE;
-- DROP TABLE IF EXISTS time_slots CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS scheduling_policies CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    building VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lecture_halls (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    facilities TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    student_count INT NOT NULL CHECK (student_count >= 0),
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_slots (
    id VARCHAR(50) PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    is_lunch_slot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_day_time UNIQUE (day, start_time, end_time)
);

CREATE TABLE IF NOT EXISTS scheduling_policies (
    id VARCHAR(50) PRIMARY KEY,
    lunch_break_start VARCHAR(10) DEFAULT '12:00',
    lunch_break_end VARCHAR(10) DEFAULT '13:00',
    lunch_break_enforced BOOLEAN DEFAULT TRUE,
    min_transition_minutes INT DEFAULT 15,
    max_consecutive_hours INT DEFAULT 3,
    building_change_buffer_minutes INT DEFAULT 20,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    lecture_hall_id VARCHAR(50) REFERENCES lecture_halls(id) ON DELETE CASCADE,
    time_slot_id VARCHAR(50) REFERENCES time_slots(id) ON DELETE CASCADE,
    day VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
