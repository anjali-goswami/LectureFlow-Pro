import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export async function migrateAndSeedDb(pool) {
  const client = await pool.connect();
  try {
    console.log('🚀 [Neon DB] Running schema migration and table setup...');

    await client.query(`
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
        capacity INT NOT NULL,
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
        student_count INT NOT NULL,
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
        CONSTRAINT unique_day_slot UNIQUE (day, start_time, end_time)
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
    `);

    // Check if departments table has data
    const resDepts = await client.query('SELECT COUNT(*) FROM departments');
    const count = parseInt(resDepts.rows[0].count, 10);

    if (count === 0) {
      console.log('🌱 [Neon DB] Seeding rich academic dataset...');

      // 1. Departments
      await client.query(`
        INSERT INTO departments (id, name, code, description, building) VALUES
        ('dept-001', 'Computer Science & AI', 'CS', 'Department of Computer Science, Software Engineering & AI', 'Turing Innovation Center'),
        ('dept-002', 'Mathematics & Analytics', 'MATH', 'Department of Pure Mathematics, Applied Statistics & Data Science', 'Euler Hall of Science'),
        ('dept-003', 'Physics & Quantum Tech', 'PHYS', 'Department of Physics, Quantum Optics & Astrophysics', 'Newton Physics Complex'),
        ('dept-004', 'Electrical & Robotics', 'EE', 'Department of Electrical Engineering, Microelectronics & Robotics', 'Tesla Engineering Quad'),
        ('dept-005', 'Business & Economics', 'BUS', 'School of Business Management, Finance & Global Markets', 'Commerce Tower'),
        ('dept-006', 'Biomedical Engineering', 'BME', 'Department of Biomedical Sciences, Biotechnology & Healthcare', 'Franklin Life Sciences')
        ON CONFLICT (id) DO NOTHING;
      `);

      // 2. Lecture Halls
      await client.query(`
        INSERT INTO lecture_halls (id, room_number, location, capacity, facilities, is_available) VALUES
        ('hall-001', 'A101', 'Turing Innovation Center, 1st Floor', 55, ARRAY['4K Projector', 'Whiteboard', 'Surround Audio', 'Gigabit WiFi'], true),
        ('hall-002', 'A102 (Lab)', 'Turing Innovation Center, 1st Floor', 110, ARRAY['Dual Projectors', 'Computer Lab', 'Smart Board', 'Audio System', 'Lecture Recording'], true),
        ('hall-003', 'B201', 'Newton Physics Complex, 2nd Floor', 160, ARRAY['Triple Projection', 'Whiteboard', 'Microphone Array', 'Video Conferencing', 'Climate Control'], true),
        ('hall-004', 'B202', 'Newton Physics Complex, 2nd Floor', 85, ARRAY['Interactive Display', 'Whiteboard', 'Sound System', 'AC'], true),
        ('hall-005', 'C301 (Auditorium)', 'Tesla Engineering Quad, 3rd Floor', 230, ARRAY['Stadium Seating', 'Stage Audio', 'Broadcast Studio', 'Air Conditioning', 'Dual Projectors'], true),
        ('hall-006', 'C302', 'Tesla Engineering Quad, 3rd Floor', 70, ARRAY['Smart Board', 'Whiteboard', 'Air Conditioning', 'WiFi'], true),
        ('hall-007', 'D105', 'Euler Hall of Science, Ground Floor', 45, ARRAY['Document Camera', 'Whiteboard', 'Projector', 'Wheelchair Accessible'], true),
        ('hall-008', 'E204', 'Commerce Tower, 2nd Floor', 130, ARRAY['Tiered Seating', 'Dual Screens', 'Sound System', 'High-speed WiFi'], true)
        ON CONFLICT (id) DO NOTHING;
      `);

      // 3. Courses
      await client.query(`
        INSERT INTO courses (id, code, name, instructor, department_id, student_count, credits) VALUES
        ('course-001', 'CS101', 'Intro to Computer Science & Algorithms', 'Prof. James Wilson', 'dept-001', 125, 4),
        ('course-002', 'CS201', 'Data Structures & System Architecture', 'Dr. Sarah Johnson', 'dept-001', 85, 4),
        ('course-003', 'MATH101', 'Multivariable Calculus & Analysis', 'Prof. Robert Davis', 'dept-002', 150, 4),
        ('course-004', 'PHYS101', 'Classical Mechanics & Wave Dynamics', 'Dr. Michael Chen', 'dept-003', 95, 4),
        ('course-005', 'EE101', 'Circuit Theory & Digital Logic', 'Prof. Thomas Brown', 'dept-004', 65, 3),
        ('course-006', 'CS301', 'Relational Databases & Cloud Storage', 'Dr. Jennifer Lee', 'dept-001', 50, 3),
        ('course-007', 'MATH201', 'Linear Algebra & Matrix Operations', 'Dr. Lisa Wang', 'dept-002', 75, 3),
        ('course-008', 'BUS101', 'Strategic Management & Leadership', 'Prof. Karen White', 'dept-005', 120, 3),
        ('course-009', 'CS401', 'Distributed Operating Systems', 'Dr. Sarah Johnson', 'dept-001', 60, 4),
        ('course-010', 'BME101', 'Intro to Biomaterials & Biomechanics', 'Dr. Alan Walker', 'dept-006', 40, 3)
        ON CONFLICT (id) DO NOTHING;
      `);

      // 4. Time Slots (Monday - Friday)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const slotTemplates = [
        { start: '08:30', end: '09:45', isLunch: false },
        { start: '10:00', end: '11:15', isLunch: false },
        { start: '11:30', end: '12:45', isLunch: true }, // Overlaps 12:00-13:00 lunch window
        { start: '13:00', end: '14:15', isLunch: false },
        { start: '14:30', end: '15:45', isLunch: false },
        { start: '16:00', end: '17:15', isLunch: false }
      ];

      for (const day of days) {
        for (let i = 0; i < slotTemplates.length; i++) {
          const t = slotTemplates[i];
          const slotId = `slot-${day.slice(0, 3).toLowerCase()}-${i + 1}`;
          await client.query(`
            INSERT INTO time_slots (id, day, start_time, end_time, is_lunch_slot)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (day, start_time, end_time) DO NOTHING;
          `, [slotId, day, t.start, t.end, t.isLunch]);
        }
      }

      // 5. Policies
      await client.query(`
        INSERT INTO scheduling_policies (id, lunch_break_start, lunch_break_end, lunch_break_enforced, min_transition_minutes, max_consecutive_hours, building_change_buffer_minutes)
        VALUES ('policy-default', '12:00', '13:00', true, 15, 3, 20)
        ON CONFLICT (id) DO UPDATE SET
          lunch_break_start = EXCLUDED.lunch_break_start,
          lunch_break_end = EXCLUDED.lunch_break_end,
          lunch_break_enforced = EXCLUDED.lunch_break_enforced;
      `);

      // 6. Users
      await client.query(`
        INSERT INTO users (id, username, password, role, name, email) VALUES
        ('user-001', 'admin', 'admin123', 'admin', 'System Administrator', 'admin@university.edu'),
        ('user-002', 'staff', 'staff123', 'staff', 'Academic Coordinator', 'staff@university.edu')
        ON CONFLICT (username) DO NOTHING;
      `);

      // 7. Initial Live Schedules with 1 realistic lunch-break conflict to showcase detection & 1-click solver
      await client.query(`
        INSERT INTO schedules (id, course_id, lecture_hall_id, time_slot_id, day, start_time, end_time) VALUES
        ('sch-001', 'course-001', 'hall-003', 'slot-mon-1', 'Monday', '08:30', '09:45'),
        ('sch-002', 'course-002', 'hall-004', 'slot-mon-2', 'Monday', '10:00', '11:15'),
        ('sch-003', 'course-003', 'hall-005', 'slot-mon-4', 'Monday', '13:00', '14:15'),
        ('sch-004', 'course-004', 'hall-002', 'slot-tue-2', 'Tuesday', '10:00', '11:15'),
        ('sch-005', 'course-005', 'hall-006', 'slot-tue-4', 'Tuesday', '13:00', '14:15'),
        ('sch-006', 'course-007', 'hall-004', 'slot-wed-1', 'Wednesday', '08:30', '09:45'),
        ('sch-007', 'course-008', 'hall-008', 'slot-wed-4', 'Wednesday', '13:00', '14:15'),
        -- Illustrative lunch conflict: 11:30 - 12:45 overlaps with 12:00-13:00 lunch hour
        ('sch-008', 'course-006', 'hall-001', 'slot-mon-3', 'Monday', '11:30', '12:45')
        ON CONFLICT (id) DO NOTHING;
      `);

      console.log('✅ [Neon DB] Seeding completed successfully!');
    } else {
      console.log(`ℹ️ [Neon DB] Tables already contain ${count} departments. Preserving existing live data.`);
    }
  } catch (err) {
    console.error('❌ [Neon DB] Error in migration/seeding:', err);
    throw err;
  } finally {
    client.release();
  }
}
