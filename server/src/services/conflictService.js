import { dbStore } from '../config/db.js';

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timesOverlap(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export async function detectAllConflicts(customSchedules = null) {
  const schedules = customSchedules || await dbStore.getSchedules();
  const courses = await dbStore.getCourses();
  const halls = await dbStore.getLectureHalls();
  const timeSlots = await dbStore.getTimeSlots();
  const policies = await dbStore.getPolicies();

  const conflicts = [];
  const conflictIdBase = `conf-${Date.now()}`;

  const lunchStart = timeToMinutes(policies.lunchBreakStart || '12:00');
  const lunchEnd = timeToMinutes(policies.lunchBreakEnd || '13:00');
  const minTransition = policies.minTransitionMinutes || 15;

  // 1. Capacity Conflicts
  schedules.forEach((schedule, idx) => {
    const course = courses.find(c => c.id === schedule.courseId);
    const hall = halls.find(h => h.id === schedule.lectureHallId);

    if (course && hall && hall.capacity < course.studentCount) {
      const deficit = course.studentCount - hall.capacity;
      const otherSchedulesAtSlot = schedules.filter(
        s => s.id !== schedule.id && s.day === schedule.day && timesOverlap(s.startTime, s.endTime, schedule.startTime, schedule.endTime)
      );
      const bookedHallIds = new Set(otherSchedulesAtSlot.map(s => s.lectureHallId));

      const availableLargerHalls = halls.filter(
        h => h.isAvailable && h.capacity >= course.studentCount && !bookedHallIds.has(h.id)
      ).sort((a, b) => a.capacity - b.capacity);

      const resolutions = availableLargerHalls.map((altHall, hIdx) => ({
        id: `res-cap-${schedule.id}-${hIdx}`,
        type: 'hall_change',
        title: `Relocate to Room ${altHall.roomNumber} (${altHall.capacity} seats)`,
        description: `Move ${course.code} to ${altHall.roomNumber} in ${altHall.location}. Completely accommodates ${course.studentCount} enrolled students.`,
        suggestedChanges: {
          scheduleId: schedule.id,
          newLectureHallId: altHall.id
        },
        impact: 'low',
        isRecommended: hIdx === 0
      }));

      if (course.studentCount > 80) {
        resolutions.push({
          id: `res-cap-split-${schedule.id}`,
          type: 'course_split',
          title: `Split ${course.code} into 2 Sections`,
          description: `Divide ${course.studentCount} students into two sections to comfortably fit in Room ${hall.roomNumber}.`,
          suggestedChanges: {
            scheduleId: schedule.id,
            splitCourse: true
          },
          impact: 'medium',
          isRecommended: resolutions.length === 0
        });
      }

      conflicts.push({
        id: `${conflictIdBase}-cap-${idx}`,
        type: 'capacity',
        title: `Capacity Deficit: ${course.code} in Room ${hall.roomNumber}`,
        description: `${course.name} has ${course.studentCount} students enrolled, but Room ${hall.roomNumber} has a limit of only ${hall.capacity} seats (${deficit} students unseated).`,
        affectedSchedules: [schedule.id],
        severity: deficit > 30 ? 'high' : 'medium',
        resolutions
      });
    }
  });

  // 2. Hall Overlaps / Collisions
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const s1 = schedules[i];
      const s2 = schedules[j];

      if (s1.day === s2.day && s1.lectureHallId === s2.lectureHallId) {
        if (timesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
          const course1 = courses.find(c => c.id === s1.courseId);
          const course2 = courses.find(c => c.id === s2.courseId);
          const hall = halls.find(h => h.id === s1.lectureHallId);

          const activeHallIdsAtSlot = new Set(
            schedules
              .filter(s => s.day === s1.day && timesOverlap(s.startTime, s.endTime, s1.startTime, s1.endTime))
              .map(s => s.lectureHallId)
          );

          const freeHallsForCourse2 = halls.filter(
            h => h.isAvailable && !activeHallIdsAtSlot.has(h.id) && h.capacity >= (course2?.studentCount || 0)
          );

          const resolutions = [];
          if (freeHallsForCourse2.length > 0) {
            resolutions.push({
              id: `res-hall-alt-${s2.id}`,
              type: 'hall_change',
              title: `Shift ${course2?.code} to Room ${freeHallsForCourse2[0].roomNumber}`,
              description: `Move ${course2?.name} to Room ${freeHallsForCourse2[0].roomNumber} (${freeHallsForCourse2[0].capacity} seats) at the same time.`,
              suggestedChanges: {
                scheduleId: s2.id,
                newLectureHallId: freeHallsForCourse2[0].id
              },
              impact: 'low',
              isRecommended: true
            });
          }

          conflicts.push({
            id: `${conflictIdBase}-hall-${i}-${j}`,
            type: 'hall',
            title: `Room Collision in ${hall?.roomNumber}`,
            description: `Both ${course1?.code} and ${course2?.code} are allocated to Room ${hall?.roomNumber} on ${s1.day} during overlapping hours (${s1.startTime}-${s1.endTime} vs ${s2.startTime}-${s2.endTime}).`,
            affectedSchedules: [s1.id, s2.id],
            severity: 'high',
            resolutions
          });
        }
      }
    }
  }

  // 3. Instructor Conflicts
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const s1 = schedules[i];
      const s2 = schedules[j];
      const c1 = courses.find(c => c.id === s1.courseId);
      const c2 = courses.find(c => c.id === s2.courseId);

      if (c1 && c2 && c1.instructor === c2.instructor && s1.day === s2.day) {
        if (timesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
          const resolutions = [
            {
              id: `res-inst-${s2.id}`,
              type: 'time_change',
              title: `Reschedule ${c2.code} to Open Slot`,
              description: `Shift ${c2.name} to another slot to resolve ${c1.instructor}'s simultaneous teaching clash.`,
              suggestedChanges: {
                scheduleId: s2.id,
                needBuffer: true
              },
              impact: 'medium',
              isRecommended: true
            }
          ];

          conflicts.push({
            id: `${conflictIdBase}-instructor-${i}-${j}`,
            type: 'instructor',
            title: `Faculty Clash: ${c1.instructor}`,
            description: `${c1.instructor} is concurrently scheduled to teach both ${c1.code} and ${c2.code} on ${s1.day} during overlapping hours.`,
            affectedSchedules: [s1.id, s2.id],
            severity: 'high',
            resolutions
          });
        }
      }
    }
  }

  // 4. LUNCH BREAK CONFLICTS
  if (policies.lunchBreakEnforced) {
    schedules.forEach((schedule, idx) => {
      const sStart = timeToMinutes(schedule.startTime);
      const sEnd = timeToMinutes(schedule.endTime);

      if (sStart < lunchEnd && lunchStart < sEnd) {
        const overlapMinutes = Math.min(sEnd, lunchEnd) - Math.max(sStart, lunchStart);
        const course = courses.find(c => c.id === schedule.courseId);
        const hall = halls.find(h => h.id === schedule.lectureHallId);

        const safeSlots = timeSlots.filter(ts => {
          if (ts.day !== schedule.day) return false;
          const tsStart = timeToMinutes(ts.startTime);
          const tsEnd = timeToMinutes(ts.endTime);
          return !(tsStart < lunchEnd && lunchStart < tsEnd);
        });

        const resolutions = safeSlots.slice(0, 3).map((slot, sIdx) => {
          const isAfternoon = timeToMinutes(slot.startTime) >= lunchEnd;
          return {
            id: `res-lunch-${schedule.id}-${sIdx}`,
            type: 'lunch_shift',
            title: `Shift to ${isAfternoon ? 'Afternoon' : 'Morning'} Slot (${slot.startTime} - ${slot.endTime})`,
            description: `Move ${course?.code} to break-compliant slot ${slot.startTime} - ${slot.endTime}. Guarantees 12:00-13:00 lunch break for students and faculty.`,
            suggestedChanges: {
              scheduleId: schedule.id,
              newTimeSlotId: slot.id,
              newStartTime: slot.startTime,
              newEndTime: slot.endTime
            },
            impact: 'low',
            isRecommended: sIdx === 0
          };
        });

        conflicts.push({
          id: `${conflictIdBase}-lunch-${idx}`,
          type: 'lunch_break',
          title: `Lunch Break Violation: ${course?.code} (${course?.name})`,
          description: `${course?.name} (${schedule.startTime} - ${schedule.endTime}) infringes upon the institutional lunch break (${policies.lunchBreakStart} - ${policies.lunchBreakEnd}) by ${overlapMinutes} minutes in Room ${hall?.roomNumber}.`,
          affectedSchedules: [schedule.id],
          severity: overlapMinutes >= 30 ? 'high' : 'medium',
          resolutions
        });
      }
    });
  }

  // 5. INSUFFICIENT TRANSITION / PASSING BREAK CONFLICTS
  const dayGroups = {};
  schedules.forEach(s => {
    if (!dayGroups[s.day]) dayGroups[s.day] = [];
    dayGroups[s.day].push(s);
  });

  Object.entries(dayGroups).forEach(([day, daySchedules]) => {
    const sorted = [...daySchedules].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const instructorClasses = {};

    sorted.forEach(s => {
      const c = courses.find(course => course.id === s.courseId);
      if (c?.instructor) {
        if (!instructorClasses[c.instructor]) instructorClasses[c.instructor] = [];
        instructorClasses[c.instructor].push({ schedule: s, course: c });
      }
    });

    Object.entries(instructorClasses).forEach(([instructor, items]) => {
      for (let k = 0; k < items.length - 1; k++) {
        const item1 = items[k];
        const item2 = items[k + 1];
        const end1 = timeToMinutes(item1.schedule.endTime);
        const start2 = timeToMinutes(item2.schedule.startTime);

        if (start2 >= end1) {
          const gapMinutes = start2 - end1;
          const hall1 = halls.find(h => h.id === item1.schedule.lectureHallId);
          const hall2 = halls.find(h => h.id === item2.schedule.lectureHallId);
          const differentBuildings = hall1 && hall2 && hall1.location.split(',')[0] !== hall2.location.split(',')[0];
          const requiredGap = differentBuildings ? (policies.buildingChangeBufferMinutes || 20) : minTransition;

          if (gapMinutes < requiredGap) {
            conflicts.push({
              id: `${conflictIdBase}-transition-${item1.schedule.id}-${item2.schedule.id}`,
              type: 'insufficient_break',
              title: `Insufficient Transition Break for ${instructor}`,
              description: `${instructor} has only ${gapMinutes} minutes gap between ${item1.course.code} (ends ${item1.schedule.endTime}) and ${item2.course.code} (starts ${item2.schedule.startTime}). Required buffer is ${requiredGap} minutes.`,
              affectedSchedules: [item1.schedule.id, item2.schedule.id],
              severity: gapMinutes === 0 ? 'high' : 'medium',
              resolutions: [
                {
                  id: `res-buffer-${item2.schedule.id}`,
                  type: 'time_change',
                  title: `Inject Buffer: Move ${item2.course.code}`,
                  description: `Reschedule ${item2.course.code} to allow at least a ${requiredGap}-minute passing buffer.`,
                  suggestedChanges: {
                    scheduleId: item2.schedule.id,
                    needBuffer: true
                  },
                  impact: 'low',
                  isRecommended: true
                }
              ]
            });
          }
        }
      }
    });
  });

  return conflicts;
}
