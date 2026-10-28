import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError(400, 'Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId) || typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) {
    throw httpError(400, 'Valid userId and teamId values are required');
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError(400, 'A type and positive minutes value are required');
  }

  const [user, team] = await Promise.all([User.findById(userId).select('_id'), Team.findById(teamId).select('_id')]);
  if (!user || !team) throw httpError(404, 'The requested user or team was not found');

  return Activity.create({ user: user._id, team: team._id, type: type.trim(), minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError(400, 'Team details are required');
  const { name, mascot } = input;
  const memberIds = input.members ?? [];
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw httpError(400, 'A team name and mascot are required');
  }
  if (!Array.isArray(memberIds) || memberIds.some((memberId) => typeof memberId !== 'string' || !Types.ObjectId.isValid(memberId))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (existingMembers.length !== uniqueMemberIds.length) throw httpError(400, 'One or more team members were not found');

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate([
    { $lookup: { from: Activity.collection.name, localField: '_id', foreignField: 'team', as: 'activities' } },
    { $addFields: { totalPoints: { $sum: '$activities.points' } } },
    { $sort: { totalPoints: -1, name: 1 } },
    { $project: { _id: 0, teamName: '$name', totalPoints: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  const recentType = recentActivities[0]?.type;
  const goal = user.fitnessGoal.toLowerCase();
  const recentFocus = recentType?.toLowerCase();
  const workouts = await Workout.find().lean();
  workouts.sort((left, right) => {
    const score = (focus: string) => {
      const normalizedFocus = focus.toLowerCase();
      return Number(normalizedFocus === goal) * 2 + Number(normalizedFocus === recentFocus);
    };
    return score(right.focus) - score(left.focus) || left.title.localeCompare(right.title);
  });

  return workouts.map((workout) => {
    const focus = workout.focus.toLowerCase();
    const reason = focus === goal
      ? `Recommended to support your ${user.fitnessGoal} goal.`
      : focus === recentFocus
        ? `Based on your recent ${recentType} activity.`
        : `A balanced option for your ${user.fitnessGoal} goal.`;
    return { ...workout, reason };
  });
}

export { User };
