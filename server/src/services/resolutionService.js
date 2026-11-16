import { dbStore } from '../config/db.js';
import { detectAllConflicts } from './conflictService.js';
import { runAutoScheduler } from './schedulerService.js';

export async function applySingleResolution(resolution) {
  const { suggestedChanges } = resolution;
  if (!suggestedChanges || !suggestedChanges.scheduleId) {
    throw new Error('Invalid resolution: missing target schedule');
  }

  const schedule = await dbStore.getScheduleById(suggestedChanges.scheduleId);
  if (!schedule) {
    throw new Error(`Schedule with id ${suggestedChanges.scheduleId} not found`);
  }

  const updates = {};
  if (suggestedChanges.newLectureHallId) updates.lectureHallId = suggestedChanges.newLectureHallId;
  if (suggestedChanges.newTimeSlotId) updates.timeSlotId = suggestedChanges.newTimeSlotId;
  if (suggestedChanges.newDay) updates.day = suggestedChanges.newDay;
  if (suggestedChanges.newStartTime) updates.startTime = suggestedChanges.newStartTime;
  if (suggestedChanges.newEndTime) updates.endTime = suggestedChanges.newEndTime;

  if (suggestedChanges.needBuffer) {
    const timeSlots = await dbStore.getTimeSlots();
    const candidate = timeSlots.find(ts => ts.day === schedule.day && ts.startTime > schedule.startTime);
    if (candidate) {
      updates.timeSlotId = candidate.id;
      updates.startTime = candidate.startTime;
      updates.endTime = candidate.endTime;
    }
  }

  const updatedSchedule = await dbStore.updateSchedule(suggestedChanges.scheduleId, updates);
  const remainingConflicts = await detectAllConflicts();

  return {
    success: true,
    appliedResolution: resolution,
    updatedSchedule,
    remainingConflictsCount: remainingConflicts.length,
    remainingConflicts
  };
}

export async function autoResolveAllConflicts() {
  let iterations = 0;
  const maxIterations = 8;
  const resolutionLog = [];

  let currentConflicts = await detectAllConflicts();

  while (currentConflicts.length > 0 && iterations < maxIterations) {
    iterations++;
    const conflict = currentConflicts[0];
    const bestResolution = conflict.resolutions?.find(r => r.isRecommended) || conflict.resolutions?.[0];

    if (bestResolution && bestResolution.suggestedChanges?.scheduleId) {
      try {
        await applySingleResolution(bestResolution);
        resolutionLog.push({
          conflictTitle: conflict.title,
          appliedSolution: bestResolution.title,
          type: bestResolution.type
        });
      } catch (err) {
        console.warn(`Could not apply resolution for conflict ${conflict.id}:`, err.message);
      }
    } else {
      await runAutoScheduler({ enforceLunchBreak: true, minBufferMinutes: 15 });
      resolutionLog.push({
        conflictTitle: conflict.title,
        appliedSolution: 'Executed automated constraint solver pass',
        type: 'auto_reschedule'
      });
      break;
    }

    currentConflicts = await detectAllConflicts();
  }

  const finalConflicts = await detectAllConflicts();

  return {
    success: true,
    resolvedCount: resolutionLog.length,
    remainingCount: finalConflicts.length,
    resolutionLog,
    remainingConflicts: finalConflicts,
    schedules: await dbStore.getSchedules()
  };
}
