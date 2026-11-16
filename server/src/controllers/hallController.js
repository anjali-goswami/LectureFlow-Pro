import { dbStore } from '../config/db.js';

export const getAllLectureHalls = async (req, res) => {
  try {
    const halls = await dbStore.getLectureHalls();
    return res.json(halls);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getLectureHallById = async (req, res) => {
  try {
    const hall = await dbStore.getLectureHallById(req.params.id);
    if (!hall) return res.status(404).json({ error: 'Lecture hall not found' });
    return res.json(hall);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createLectureHall = async (req, res) => {
  try {
    const { roomNumber, location, capacity, facilities, isAvailable } = req.body;
    if (!roomNumber || !capacity) {
      return res.status(400).json({ error: 'Room number and capacity are required' });
    }
    const created = await dbStore.createLectureHall({
      roomNumber,
      location,
      capacity,
      facilities,
      isAvailable
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateLectureHall = async (req, res) => {
  try {
    const updated = await dbStore.updateLectureHall(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lecture hall not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteLectureHall = async (req, res) => {
  try {
    const deleted = await dbStore.deleteLectureHall(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Lecture hall not found' });
    return res.json({ message: 'Lecture hall deleted successfully', hall: deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const toggleHallStatus = async (req, res) => {
  try {
    const updated = await dbStore.toggleHallStatus(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Lecture hall not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
