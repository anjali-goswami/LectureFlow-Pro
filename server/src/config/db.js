import pg from 'pg';
import dotenv from 'dotenv';
import { migrateAndSeedDb } from './migrateAndSeed.js';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isConnected = false;

export async function initializeDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.trim() === '') {
    console.warn('[Neon DB] Notice: DATABASE_URL not found in server/.env');
    return false;
  }

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    const res = await client.query('SELECT current_database(), current_user');
    client.release();

    isConnected = true;
    console.log(`✅ [Neon DB] Successfully connected to PostgreSQL database '${res.rows[0].current_database}' as user '${res.rows[0].current_user}'`);

    // Ensure all tables and seed data exist
    await migrateAndSeedDb(pool);
    return true;
  } catch (error) {
    console.error('❌ [Neon DB] Connection failed:', error.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}

export async function query(text, params) {
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }
  return pool.query(text, params);
}

// ==========================================
// LIVE DATABASE REPOSITORY METHODS (Neon DB)
// ==========================================

export const dbStore = {
  // --- DEPARTMENTS ---
  async getDepartments() {
    const res = await query(`
      SELECT d.*,
             COUNT(DISTINCT c.id)::int AS course_count,
             COALESCE(SUM(c.student_count), 0)::int AS total_students
      FROM departments d
      LEFT JOIN courses c ON c.department_id = d.id
      GROUP BY d.id
      ORDER BY d.name ASC
    `);
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      building: r.building,
      courseCount: r.course_count,
      totalStudents: r.total_students
    }));
  },

  async getDepartmentById(id) {
    const res = await query('SELECT * FROM departments WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async createDepartment({ id, name, code, description, building }) {
    const newId = id || `dept-${Date.now().toString(36)}`;
    const res = await query(
      'INSERT INTO departments (id, name, code, description, building) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, name, code, description || '', building || 'Main Campus']
    );
    return res.rows[0];
  },

  async updateDepartment(id, { name, code, description, building }) {
    const res = await query(`
      UPDATE departments
      SET name = COALESCE($2, name),
          code = COALESCE($3, code),
          description = COALESCE($4, description),
          building = COALESCE($5, building)
      WHERE id = $1
      RETURNING *
    `, [id, name, code, description, building]);
    return res.rows[0] || null;
  },

  async deleteDepartment(id) {
    const res = await query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },

  // --- COURSES ---
  async getCourses() {
    const res = await query(`
      SELECT c.*,
             d.name AS department_name,
             d.code AS department_code,
             EXISTS(SELECT 1 FROM schedules s WHERE s.course_id = c.id) AS is_scheduled
      FROM courses c
      LEFT JOIN departments d ON d.id = c.department_id
      ORDER BY c.code ASC
    `);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      instructor: r.instructor,
      departmentId: r.department_id,
      departmentName: r.department_name || 'Unassigned',
      departmentCode: r.department_code || '',
      studentCount: r.student_count,
      credits: r.credits,
      isScheduled: r.is_scheduled
    }));
  },

  async getCourseById(id) {
    const res = await query('SELECT * FROM courses WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      instructor: r.instructor,
      departmentId: r.department_id,
      studentCount: r.student_count,
      credits: r.credits
    };
  },

  async createCourse({ id, code, name, instructor, departmentId, studentCount, credits }) {
    const newId = id || `course-${Date.now().toString(36)}`;
    const res = await query(
      'INSERT INTO courses (id, code, name, instructor, department_id, student_count, credits) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newId, code, name, instructor, departmentId || null, parseInt(studentCount, 10) || 0, parseInt(credits, 10) || 3]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      instructor: r.instructor,
      departmentId: r.department_id,
      studentCount: r.student_count,
      credits: r.credits
    };
  },

  async updateCourse(id, { code, name, instructor, departmentId, studentCount, credits }) {
    const res = await query(`
      UPDATE courses
      SET code = COALESCE($2, code),
          name = COALESCE($3, name),
          instructor = COALESCE($4, instructor),
          department_id = COALESCE($5, department_id),
          student_count = COALESCE($6, student_count),
          credits = COALESCE($7, credits)
      WHERE id = $1
      RETURNING *
    `, [id, code, name, instructor, departmentId, studentCount, credits]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      instructor: r.instructor,
      departmentId: r.department_id,
      studentCount: r.student_count,
      credits: r.credits
    };
  },

  async deleteCourse(id) {
    const res = await query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },

  // --- LECTURE HALLS ---
  async getLectureHalls() {
    const res = await query(`
      SELECT h.*,
             COUNT(DISTINCT s.id)::int AS scheduled_count
      FROM lecture_halls h
      LEFT JOIN schedules s ON s.lecture_hall_id = h.id
      GROUP BY h.id
      ORDER BY h.room_number ASC
    `);
    const totalSlotsRes = await query('SELECT COUNT(*) FROM time_slots');
    const totalSlots = parseInt(totalSlotsRes.rows[0].count, 10) || 1;

    return res.rows.map(r => ({
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      facilities: r.facilities || [],
      isAvailable: r.is_available,
      scheduledCount: r.scheduled_count,
      utilizationRate: Math.min(100, Math.round((r.scheduled_count / totalSlots) * 100))
    }));
  },

  async getLectureHallById(id) {
    const res = await query('SELECT * FROM lecture_halls WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      facilities: r.facilities || [],
      isAvailable: r.is_available
    };
  },

  async createLectureHall({ id, roomNumber, location, capacity, facilities, isAvailable }) {
    const newId = id || `hall-${Date.now().toString(36)}`;
    const res = await query(
      'INSERT INTO lecture_halls (id, room_number, location, capacity, facilities, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newId, roomNumber, location || 'Main Campus', parseInt(capacity, 10) || 50, Array.isArray(facilities) ? facilities : [], isAvailable !== false]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      facilities: r.facilities,
      isAvailable: r.is_available
    };
  },

  async updateLectureHall(id, { roomNumber, location, capacity, facilities, isAvailable }) {
    const res = await query(`
      UPDATE lecture_halls
      SET room_number = COALESCE($2, room_number),
          location = COALESCE($3, location),
          capacity = COALESCE($4, capacity),
          facilities = COALESCE($5, facilities),
          is_available = COALESCE($6, is_available)
      WHERE id = $1
      RETURNING *
    `, [id, roomNumber, location, capacity, facilities, isAvailable]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      facilities: r.facilities,
      isAvailable: r.is_available
    };
  },

  async deleteLectureHall(id) {
    const res = await query('DELETE FROM lecture_halls WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },

  async toggleHallStatus(id) {
    const res = await query('UPDATE lecture_halls SET is_available = NOT is_available WHERE id = $1 RETURNING *', [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      facilities: r.facilities,
      isAvailable: r.is_available
    };
  },

  // --- TIME SLOTS ---
  async getTimeSlots() {
    const res = await query(`
      SELECT t.*,
             COUNT(DISTINCT s.id)::int AS scheduled_count
      FROM time_slots t
      LEFT JOIN schedules s ON s.time_slot_id = t.id
      GROUP BY t.id
      ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          ELSE 6
        END,
        t.start_time ASC
    `);
    return res.rows.map(r => ({
      id: r.id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      isLunchSlot: r.is_lunch_slot,
      scheduledCount: r.scheduled_count
    }));
  },

  async getTimeSlotById(id) {
    const res = await query('SELECT * FROM time_slots WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      isLunchSlot: r.is_lunch_slot
    };
  },

  async createTimeSlot({ id, day, startTime, endTime, isLunchSlot }) {
    const newId = id || `slot-${Date.now().toString(36)}`;
    const res = await query(
      'INSERT INTO time_slots (id, day, start_time, end_time, is_lunch_slot) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, day, startTime, endTime, Boolean(isLunchSlot)]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      isLunchSlot: r.is_lunch_slot
    };
  },

  async updateTimeSlot(id, { day, startTime, endTime, isLunchSlot }) {
    const res = await query(`
      UPDATE time_slots
      SET day = COALESCE($2, day),
          start_time = COALESCE($3, start_time),
          end_time = COALESCE($4, end_time),
          is_lunch_slot = COALESCE($5, is_lunch_slot)
      WHERE id = $1
      RETURNING *
    `, [id, day, startTime, endTime, isLunchSlot]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      isLunchSlot: r.is_lunch_slot
    };
  },

  async deleteTimeSlot(id) {
    const res = await query('DELETE FROM time_slots WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },

  // --- POLICIES ---
  async getPolicies() {
    const res = await query('SELECT * FROM scheduling_policies LIMIT 1');
    if (!res.rows[0]) {
      return {
        id: 'policy-default',
        lunchBreakStart: '12:00',
        lunchBreakEnd: '13:00',
        lunchBreakEnforced: true,
        minTransitionMinutes: 15,
        maxConsecutiveHours: 3,
        buildingChangeBufferMinutes: 20
      };
    }
    const r = res.rows[0];
    return {
      id: r.id,
      lunchBreakStart: r.lunch_break_start,
      lunchBreakEnd: r.lunch_break_end,
      lunchBreakEnforced: r.lunch_break_enforced,
      minTransitionMinutes: r.min_transition_minutes,
      maxConsecutiveHours: r.max_consecutive_hours,
      buildingChangeBufferMinutes: r.building_change_buffer_minutes
    };
  },

  async updatePolicies(updates) {
    const current = await this.getPolicies();
    const merged = { ...current, ...updates };

    const res = await query(`
      INSERT INTO scheduling_policies (id, lunch_break_start, lunch_break_end, lunch_break_enforced, min_transition_minutes, max_consecutive_hours, building_change_buffer_minutes, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        lunch_break_start = EXCLUDED.lunch_break_start,
        lunch_break_end = EXCLUDED.lunch_break_end,
        lunch_break_enforced = EXCLUDED.lunch_break_enforced,
        min_transition_minutes = EXCLUDED.min_transition_minutes,
        max_consecutive_hours = EXCLUDED.max_consecutive_hours,
        building_change_buffer_minutes = EXCLUDED.building_change_buffer_minutes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      merged.id,
      merged.lunchBreakStart,
      merged.lunchBreakEnd,
      merged.lunchBreakEnforced,
      merged.minTransitionMinutes,
      merged.maxConsecutiveHours,
      merged.buildingChangeBufferMinutes
    ]);

    const r = res.rows[0];
    return {
      id: r.id,
      lunchBreakStart: r.lunch_break_start,
      lunchBreakEnd: r.lunch_break_end,
      lunchBreakEnforced: r.lunch_break_enforced,
      minTransitionMinutes: r.min_transition_minutes,
      maxConsecutiveHours: r.max_consecutive_hours,
      buildingChangeBufferMinutes: r.building_change_buffer_minutes
    };
  },

  // --- SCHEDULES ---
  async getSchedules() {
    const res = await query(`
      SELECT s.*,
             c.code AS course_code,
             c.name AS course_name,
             c.instructor AS instructor,
             c.student_count AS student_count,
             c.credits AS credits,
             c.department_id AS department_id,
             d.name AS department_name,
             d.code AS department_code,
             h.room_number AS room_number,
             h.location AS hall_location,
             h.capacity AS hall_capacity,
             h.facilities AS hall_facilities
      FROM schedules s
      LEFT JOIN courses c ON c.id = s.course_id
      LEFT JOIN departments d ON d.id = c.department_id
      LEFT JOIN lecture_halls h ON h.id = s.lecture_hall_id
      ORDER BY 
        CASE s.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          ELSE 6
        END,
        s.start_time ASC
    `);

    return res.rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      lectureHallId: r.lecture_hall_id,
      timeSlotId: r.time_slot_id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time,
      course: r.course_id ? {
        id: r.course_id,
        code: r.course_code,
        name: r.course_name,
        instructor: r.instructor,
        studentCount: r.student_count,
        credits: r.credits,
        departmentId: r.department_id
      } : null,
      department: r.department_id ? {
        id: r.department_id,
        name: r.department_name,
        code: r.department_code
      } : null,
      lectureHall: r.lecture_hall_id ? {
        id: r.lecture_hall_id,
        roomNumber: r.room_number,
        location: r.hall_location,
        capacity: r.hall_capacity,
        facilities: r.hall_facilities || []
      } : null
    }));
  },

  async getScheduleById(id) {
    const res = await query('SELECT * FROM schedules WHERE id = $1', [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      courseId: r.course_id,
      lectureHallId: r.lecture_hall_id,
      timeSlotId: r.time_slot_id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time
    };
  },

  async createSchedule({ id, courseId, lectureHallId, timeSlotId, day, startTime, endTime }) {
    const newId = id || `sch-${Date.now().toString(36)}`;
    const res = await query(`
      INSERT INTO schedules (id, course_id, lecture_hall_id, time_slot_id, day, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [newId, courseId, lectureHallId, timeSlotId || null, day, startTime, endTime]);
    const r = res.rows[0];
    return {
      id: r.id,
      courseId: r.course_id,
      lectureHallId: r.lecture_hall_id,
      timeSlotId: r.time_slot_id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time
    };
  },

  async updateSchedule(id, updates) {
    const current = await this.getScheduleById(id);
    if (!current) return null;
    const merged = { ...current, ...updates };

    const res = await query(`
      UPDATE schedules
      SET course_id = $2,
          lecture_hall_id = $3,
          time_slot_id = $4,
          day = $5,
          start_time = $6,
          end_time = $7
      WHERE id = $1
      RETURNING *
    `, [id, merged.courseId, merged.lectureHallId, merged.timeSlotId, merged.day, merged.startTime, merged.endTime]);

    const r = res.rows[0];
    return {
      id: r.id,
      courseId: r.course_id,
      lectureHallId: r.lecture_hall_id,
      timeSlotId: r.time_slot_id,
      day: r.day,
      startTime: r.start_time,
      endTime: r.end_time
    };
  },

  async deleteSchedule(id) {
    const res = await query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);
    return res.rows[0] || null;
  },

  async clearAllSchedules() {
    await query('TRUNCATE TABLE schedules CASCADE');
    return [];
  },

  async replaceAllSchedules(newSchedules) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE schedules CASCADE');
      for (const s of newSchedules) {
        await client.query(`
          INSERT INTO schedules (id, course_id, lecture_hall_id, time_slot_id, day, start_time, end_time)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [s.id, s.courseId, s.lectureHallId, s.timeSlotId, s.day, s.startTime, s.endTime]);
      }
      await client.query('COMMIT');
      return newSchedules;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // --- USERS ---
  async findUserByUsername(username) {
    const res = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return res.rows[0] || null;
  },

  async createUser({ id, username, password, name, email }) {
    const res = await query(
      `INSERT INTO users (id, username, password, role, name, email)
       VALUES ($1, $2, $3, 'staff', $4, $5)
       RETURNING id, username, role, name, email`,
      [id, username, password, name, email || null]
    );
    return res.rows[0];
  },

  async getUsers() {
    const res = await query('SELECT id, username, role, name, email FROM users');
    return res.rows;
  }
};

export { pool };
