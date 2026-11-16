import { dbStore } from '../config/db.js';

export const getPolicies = async (req, res) => {
  try {
    const policies = await dbStore.getPolicies();
    return res.json(policies);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updatePolicies = async (req, res) => {
  try {
    const {
      lunchBreakStart,
      lunchBreakEnd,
      lunchBreakEnforced,
      minTransitionMinutes,
      maxConsecutiveHours,
      buildingChangeBufferMinutes
    } = req.body;

    const updates = {};
    if (lunchBreakStart !== undefined) updates.lunchBreakStart = lunchBreakStart;
    if (lunchBreakEnd !== undefined) updates.lunchBreakEnd = lunchBreakEnd;
    if (lunchBreakEnforced !== undefined) updates.lunchBreakEnforced = Boolean(lunchBreakEnforced);
    if (minTransitionMinutes !== undefined) updates.minTransitionMinutes = parseInt(minTransitionMinutes, 10);
    if (maxConsecutiveHours !== undefined) updates.maxConsecutiveHours = parseInt(maxConsecutiveHours, 10);
    if (buildingChangeBufferMinutes !== undefined) updates.buildingChangeBufferMinutes = parseInt(buildingChangeBufferMinutes, 10);

    const updated = await dbStore.updatePolicies(updates);
    return res.json({
      message: 'Scheduling & Break policies updated in Neon PostgreSQL successfully',
      policies: updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
