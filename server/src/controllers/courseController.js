import { dbStore } from '../config/db.js';

export const getAllCourses = async (req, res) => {
  try {
    const courses = await dbStore.getCourses();
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await dbStore.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, name, instructor, departmentId, studentCount, credits } = req.body;
    if (!code || !name || !instructor) {
      return res.status(400).json({ error: 'Course code, name, and instructor are required' });
    }
    const created = await dbStore.createCourse({
      code: code.toUpperCase(),
      name,
      instructor,
      departmentId,
      studentCount,
      credits
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const updated = await dbStore.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Course not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const deleted = await dbStore.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Course not found' });
    return res.json({ message: 'Course deleted successfully', course: deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
