import { detectAllConflicts } from '../services/conflictService.js';
import { applySingleResolution, autoResolveAllConflicts } from '../services/resolutionService.js';
import { dbStore } from '../config/db.js';

export const getConflicts = async (req, res) => {
  try {
    const conflicts = await detectAllConflicts();
    const courses = await dbStore.getCourses();
    const halls = await dbStore.getLectureHalls();
    const schedules = await dbStore.getSchedules();

    const enriched = conflicts.map(c => {
      const details = c.affectedSchedules.map(schId => {
        const sch = schedules.find(s => s.id === schId);
        if (!sch) return null;
        const course = courses.find(cr => cr.id === sch.courseId);
        const hall = halls.find(h => h.id === sch.lectureHallId);
        return {
          scheduleId: sch.id,
          courseCode: course?.code,
          courseName: course?.name,
          instructor: course?.instructor,
          studentCount: course?.studentCount,
          roomNumber: hall?.roomNumber,
          capacity: hall?.capacity,
          day: sch.day,
          time: `${sch.startTime} - ${sch.endTime}`
        };
      }).filter(Boolean);

      return {
        ...c,
        affectedDetails: details
      };
    });

    const highSeverityCount = enriched.filter(c => c.severity === 'high').length;
    const breakViolationsCount = enriched.filter(c => c.type === 'lunch_break' || c.type === 'insufficient_break').length;

    return res.json({
      totalCount: enriched.length,
      highSeverityCount,
      breakViolationsCount,
      conflicts: enriched
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const applyResolution = async (req, res) => {
  try {
    const { resolution } = req.body;
    if (!resolution) {
      return res.status(400).json({ error: 'Resolution data is required' });
    }
    const result = await applySingleResolution(resolution);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const autoResolve = async (req, res) => {
  try {
    const result = await autoResolveAllConflicts();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const exportConflictsCSV = async (req, res) => {
  try {
    const conflicts = await detectAllConflicts();
    const rows = [
      ['Conflict ID', 'Type', 'Severity', 'Title', 'Description', 'Affected Schedules Count']
    ];

    conflicts.forEach(c => {
      rows.push([
        c.id,
        c.type,
        c.severity,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.description || '').replace(/"/g, '""')}"`,
        c.affectedSchedules.length
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lecture_conflicts_report.csv"');
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
