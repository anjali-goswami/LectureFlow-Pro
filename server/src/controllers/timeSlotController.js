import { dbStore } from '../config/db.js';
import { timeToMinutes } from '../services/conflictService.js';

export const getAllTimeSlots = async (req, res) => {
  try {
    const slots = await dbStore.getTimeSlots();
    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTimeSlotById = async (req, res) => {
  try {
    const slot = await dbStore.getTimeSlotById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Time slot not found' });
    return res.json(slot);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createTimeSlot = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Day, start time, and end time are required' });
    }

    const policies = await dbStore.getPolicies();
    const lunchStart = timeToMinutes(policies.lunchBreakStart || '12:00');
    const lunchEnd = timeToMinutes(policies.lunchBreakEnd || '13:00');
    const sStart = timeToMinutes(startTime);
    const sEnd = timeToMinutes(endTime);
    const overlapsLunch = sStart < lunchEnd && lunchStart < sEnd;

    const created = await dbStore.createTimeSlot({
      day,
      startTime,
      endTime,
      isLunchSlot: overlapsLunch
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateTimeSlot = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;
    const policies = await dbStore.getPolicies();

    const updates = { ...req.body };
    if (startTime && endTime) {
      const lunchStart = timeToMinutes(policies.lunchBreakStart || '12:00');
      const lunchEnd = timeToMinutes(policies.lunchBreakEnd || '13:00');
      const sStart = timeToMinutes(startTime);
      const sEnd = timeToMinutes(endTime);
      updates.isLunchSlot = sStart < lunchEnd && lunchStart < sEnd;
    }

    const updated = await dbStore.updateTimeSlot(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Time slot not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteTimeSlot = async (req, res) => {
  try {
    const deleted = await dbStore.deleteTimeSlot(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Time slot not found' });
    return res.json({ message: 'Time slot deleted successfully', timeSlot: deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
