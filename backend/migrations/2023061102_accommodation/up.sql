CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    role VARCHAR(20) CHECK (role IN ('Employee', 'Admin'))
);

CREATE TABLE "Event" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255)
);

CREATE TABLE "Preference" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
    preferred_room_type VARCHAR(50),
    roommate_gender_preference VARCHAR(20) CHECK (roommate_gender_preference IN ('Male', 'Female', 'Any')),
    notes TEXT
);

CREATE TABLE "Room" (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    room_type VARCHAR(50),
    gender_allowed VARCHAR(20) CHECK (gender_allowed IN ('Male', 'Female', 'Any'))
);

CREATE TABLE "RoommateRequest" (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Cancelled')) NOT NULL DEFAULT 'Pending',
    locked_at TIMESTAMP
);

CREATE TABLE "Allocation" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES "Room"(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AdminActionLog" (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
