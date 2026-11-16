import { dbStore } from '../config/db.js';
import { runAutoScheduler } from '../services/schedulerService.js';
import { detectAllConflicts } from '../services/conflictService.js';

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await dbStore.getSchedules();
    const conflicts = await detectAllConflicts(schedules);
    const conflictingScheduleIds = new Set();
    conflicts.forEach(c => {
      c.affectedSchedules?.forEach(id => conflictingScheduleIds.add(id));
    });

    const enriched = schedules.map(sch => ({
      ...sch,
      hasConflict: conflictingScheduleIds.has(sch.id),
      conflicts: conflicts
        .filter(c => c.affectedSchedules?.includes(sch.id))
        .map(c => ({ id: c.id, type: c.type, title: c.title, severity: c.severity }))
    }));

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { courseId, lectureHallId, timeSlotId, day, startTime, endTime } = req.body;
    if (!courseId || !lectureHallId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required scheduling fields' });
    }

    const newSchedule = await dbStore.createSchedule({
      courseId,
      lectureHallId,
      timeSlotId: timeSlotId || null,
      day,
      startTime,
      endTime
    });

    const conflicts = await detectAllConflicts();
    return res.status(201).json({
      schedule: newSchedule,
      conflictsDetected: conflicts.filter(c => c.affectedSchedules.includes(newSchedule.id))
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const updated = await dbStore.updateSchedule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Schedule not found' });

    const conflicts = await detectAllConflicts();
    return res.json({
      schedule: updated,
      conflictsDetected: conflicts.filter(c => c.affectedSchedules.includes(updated.id))
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await dbStore.deleteSchedule(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    return res.json({ message: 'Schedule unassigned successfully', schedule: deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const clearAllSchedules = async (req, res) => {
  try {
    await dbStore.clearAllSchedules();
    return res.json({ message: 'All schedules cleared in Neon PostgreSQL successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateSchedule = async (req, res) => {
  try {
    const { enforceLunchBreak = true, minBufferMinutes = 15 } = req.body || {};
    const result = await runAutoScheduler({ enforceLunchBreak, minBufferMinutes });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
