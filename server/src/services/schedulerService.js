import { dbStore } from '../config/db.js';
import { timeToMinutes, timesOverlap, detectAllConflicts } from './conflictService.js';

export async function runAutoScheduler(options = {}) {
  const {
    enforceLunchBreak = true,
    minBufferMinutes = 15
  } = options;

  const courses = await dbStore.getCourses();
  const allHalls = await dbStore.getLectureHalls();
  const halls = allHalls.filter(h => h.isAvailable);
  const timeSlots = await dbStore.getTimeSlots();
  const policies = await dbStore.getPolicies();

  const lunchStart = timeToMinutes(policies.lunchBreakStart || '12:00');
  const lunchEnd = timeToMinutes(policies.lunchBreakEnd || '13:00');

  if (courses.length === 0) {
    throw new Error('Cannot generate schedule: No courses available in database.');
  }
  if (halls.length === 0) {
    throw new Error('Cannot generate schedule: No available lecture halls found.');
  }
  if (timeSlots.length === 0) {
    throw new Error('Cannot generate schedule: No time slots defined.');
  }

  // Pre-filter time slots based on lunch break enforcement
  const validSlots = timeSlots.filter(slot => {
    if (!enforceLunchBreak) return true;
    const sStart = timeToMinutes(slot.startTime);
    const sEnd = timeToMinutes(slot.endTime);
    const overlapsLunch = sStart < lunchEnd && lunchStart < sEnd;
    return !overlapsLunch;
  });

  const sortedCourses = [...courses].sort((a, b) => b.studentCount - a.studentCount);
  const newSchedules = [];
  const hallOccupancy = new Map();
  const instructorOccupancy = new Map();

  function isHallFree(hallId, day, startStr, endStr) {
    const key = `${hallId}:${day}`;
    const intervals = hallOccupancy.get(key) || [];
    const startMin = timeToMinutes(startStr);
    const endMin = timeToMinutes(endStr);

    for (const item of intervals) {
      if (timesOverlap(startStr, endStr, item.startStr, item.endStr)) return false;
      const itemStart = timeToMinutes(item.startStr);
      const itemEnd = timeToMinutes(item.endStr);
      if (startMin >= itemEnd && (startMin - itemEnd) < minBufferMinutes) return false;
      if (itemStart >= endMin && (itemStart - endMin) < minBufferMinutes) return false;
    }
    return true;
  }

  function isInstructorFree(instructor, day, startStr, endStr) {
    const key = `${instructor}:${day}`;
    const intervals = instructorOccupancy.get(key) || [];
    const startMin = timeToMinutes(startStr);
    const endMin = timeToMinutes(endStr);

    for (const item of intervals) {
      if (timesOverlap(startStr, endStr, item.startStr, item.endStr)) return false;
      const itemStart = timeToMinutes(item.startStr);
      const itemEnd = timeToMinutes(item.endStr);
      if (startMin >= itemEnd && (startMin - itemEnd) < minBufferMinutes) return false;
      if (itemStart >= endMin && (itemStart - endMin) < minBufferMinutes) return false;
    }
    return true;
  }

  function bookHall(hallId, day, startStr, endStr) {
    const key = `${hallId}:${day}`;
    const list = hallOccupancy.get(key) || [];
    list.push({ startStr, endStr });
    hallOccupancy.set(key, list);
  }

  function bookInstructor(instructor, day, startStr, endStr) {
    const key = `${instructor}:${day}`;
    const list = instructorOccupancy.get(key) || [];
    list.push({ startStr, endStr });
    instructorOccupancy.set(key, list);
  }

  const unassignedCourses = [];

  sortedCourses.forEach((course, idx) => {
    let bestMatch = null;
    let highestScore = -Infinity;

    const fittingHalls = halls
      .filter(h => h.capacity >= course.studentCount)
      .sort((a, b) => a.capacity - b.capacity);

    const candidateHalls = fittingHalls.length > 0
      ? fittingHalls
      : [...halls].sort((a, b) => b.capacity - a.capacity);

    for (const hall of candidateHalls) {
      for (const slot of validSlots) {
        if (!isHallFree(hall.id, slot.day, slot.startTime, slot.endTime)) continue;
        if (!isInstructorFree(course.instructor, slot.day, slot.startTime, slot.endTime)) continue;

        let score = 0;
        if (hall.capacity >= course.studentCount) {
          score += 1000;
          const utilization = course.studentCount / hall.capacity;
          score += Math.round(utilization * 500);
        } else {
          score -= (course.studentCount - hall.capacity) * 20;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = { hall, slot };
        }
      }
    }

    if (bestMatch) {
      bookHall(bestMatch.hall.id, bestMatch.slot.day, bestMatch.slot.startTime, bestMatch.slot.endTime);
      bookInstructor(course.instructor, bestMatch.slot.day, bestMatch.slot.startTime, bestMatch.slot.endTime);

      const schedule = {
        id: `sch-gen-${Date.now()}-${idx}`,
        courseId: course.id,
        lectureHallId: bestMatch.hall.id,
        timeSlotId: bestMatch.slot.id,
        day: bestMatch.slot.day,
        startTime: bestMatch.slot.startTime,
        endTime: bestMatch.slot.endTime
      };
      newSchedules.push(schedule);
    } else {
      unassignedCourses.push(course);
    }
  });

  // Persist live to PostgreSQL
  await dbStore.replaceAllSchedules(newSchedules);

  const detectedConflicts = await detectAllConflicts(newSchedules);
  const totalSlotsCapacity = halls.length * timeSlots.length;
  const utilizationRate = totalSlotsCapacity > 0
    ? Math.round((newSchedules.length / totalSlotsCapacity) * 100)
    : 0;

  const lunchViolations = detectedConflicts.filter(c => c.type === 'lunch_break').length;
  const breakViolations = detectedConflicts.filter(c => c.type === 'insufficient_break').length;
  const breakComplianceRate = newSchedules.length > 0
    ? Math.max(0, Math.round(((newSchedules.length - (lunchViolations + breakViolations)) / newSchedules.length) * 100))
    : 100;

  return {
    success: true,
    generatedCount: newSchedules.length,
    unassignedCount: unassignedCourses.length,
    conflictCount: detectedConflicts.length,
    utilizationRate,
    breakComplianceRate,
    schedules: newSchedules,
    conflicts: detectedConflicts
  };
}
