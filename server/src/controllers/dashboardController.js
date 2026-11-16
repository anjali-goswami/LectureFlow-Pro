import { dbStore } from '../config/db.js';
import { detectAllConflicts } from '../services/conflictService.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const departments = await dbStore.getDepartments();
    const courses = await dbStore.getCourses();
    const halls = await dbStore.getLectureHalls();
    const slots = await dbStore.getTimeSlots();
    const schedules = await dbStore.getSchedules();
    const policies = await dbStore.getPolicies();
    const conflicts = await detectAllConflicts();

    const totalSeats = halls.reduce((sum, h) => sum + (h.capacity || 0), 0);
    const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);

    const totalSlotsCount = (slots.length * halls.length) || 1;
    const systemUtilization = Math.min(100, Math.round((schedules.length / totalSlotsCount) * 100));

    const breakViolations = conflicts.filter(c => c.type === 'lunch_break' || c.type === 'insufficient_break');
    const breakComplianceRate = schedules.length > 0
      ? Math.max(0, Math.round(((schedules.length - breakViolations.length) / schedules.length) * 100))
      : 100;

    const hallUtilization = halls.map(h => {
      const hallSchedules = schedules.filter(s => s.lectureHallId === h.id);
      const hallRate = slots.length > 0
        ? Math.round((hallSchedules.length / slots.length) * 100)
        : 0;
      return {
        id: h.id,
        roomNumber: h.roomNumber,
        capacity: h.capacity,
        scheduledClasses: hallSchedules.length,
        utilizationRate: Math.min(100, hallRate)
      };
    });

    return res.json({
      counts: {
        departments: departments.length,
        courses: courses.length,
        lectureHalls: halls.length,
        timeSlots: slots.length,
        schedules: schedules.length,
        conflicts: conflicts.length,
        breakViolations: breakViolations.length
      },
      metrics: {
        systemUtilization,
        breakComplianceRate,
        totalSeats,
        totalStudents
      },
      policies,
      hallUtilization,
      recentConflicts: conflicts.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
