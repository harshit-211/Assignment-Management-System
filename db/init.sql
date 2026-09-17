
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  onedrive_link VARCHAR(500) NOT NULL,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('all', 'group')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assignment_groups (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, group_id)
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  confirmed_by INTEGER REFERENCES users(id),
  status VARCHAR(15) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed')),
  confirmed_at TIMESTAMP,
  UNIQUE(assignment_id, group_id)
);
