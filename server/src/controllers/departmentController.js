import { dbStore } from '../config/db.js';

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await dbStore.getDepartments();
    return res.json(departments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await dbStore.getDepartmentById(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    return res.json(dept);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, building } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    const created = await dbStore.createDepartment({ name, code: code.toUpperCase(), description, building });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const updated = await dbStore.updateDepartment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Department not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const deleted = await dbStore.deleteDepartment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Department not found' });
    return res.json({ message: 'Department deleted successfully', department: deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
