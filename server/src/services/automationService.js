import {
  createAutomationRule,
  deleteAutomationRule,
  findAutomationRuleById,
  getAutomationRuleActions,
  getAutomationRuleConditions,
  listAutomationRules,
  replaceAutomationConditionsAndActions,
  updateAutomationRule,
} from "../models/automationRuleModel.js";
import { findApplianceById } from "../models/applianceModel.js";
import { createActivityLog, listActivityLogs } from "../models/activityLogModel.js";
import { findRoomById, listRoomsForUser, userHasRoomAccess } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

async function canAccessRule(rule, user) {
  if (user.role === "admin") {
    return true;
  }

  if (rule.ownerUserId === user.id) {
    return true;
  }

  if (!rule.roomId) {
    return false;
  }

  if (user.role === "resident") {
    const rooms = await listRoomsForUser(user);
    return rooms.some((room) => room.id === rule.roomId);
  }

  if (user.role === "operator") {
    return userHasRoomAccess(user.id, rule.roomId);
  }

  return false;
}

async function assertRoomAccess(roomId, user) {
  const room = await findRoomById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  if (user.role === "admin") {
    return room;
  }

  if (room.ownerUserId === user.id) {
    return room;
  }

  if (user.role === "operator" && (await userHasRoomAccess(user.id, room.id))) {
    return room;
  }

  throw new ApiError(403, "You do not have access to this room.");
}

async function assertApplianceAccess(applianceId, user) {
  const appliance = await findApplianceById(applianceId);

  if (!appliance) {
    throw new ApiError(404, "Appliance not found.");
  }

  if (user.role === "admin") {
    return appliance;
  }

  if (user.role === "resident" && appliance.roomOwnerUserId === user.id) {
    return appliance;
  }

  if (user.role === "operator" && (await userHasRoomAccess(user.id, appliance.roomId))) {
    return appliance;
  }

  throw new ApiError(403, "You do not have access to this appliance.");
}

async function assertAutomationTargetAccess(payload, user) {
  let room = null;
  let appliance = null;

  if (payload.roomId) {
    room = await assertRoomAccess(payload.roomId, user);
  }

  if (payload.applianceId) {
    appliance = await assertApplianceAccess(payload.applianceId, user);
  }

  if (room && appliance && appliance.roomId !== Number(room.id)) {
    throw new ApiError(400, "The selected appliance must belong to the selected room.");
  }
}

export async function getAutomationRules(user) {
  const rules = await listAutomationRules();
  const accessibleRules = [];

  for (const rule of rules) {
    if (await canAccessRule(rule, user)) {
      accessibleRules.push({
        ...rule,
        conditions: await getAutomationRuleConditions(rule.id),
        actions: await getAutomationRuleActions(rule.id),
      });
    }
  }

  return accessibleRules;
}

export async function getAutomationRuleById(id, user) {
  const rule = await findAutomationRuleById(id);
  if (!rule) throw new ApiError(404, "Automation rule not found.");
  if (user && !(await canAccessRule(rule, user))) {
    throw new ApiError(403, "You do not have access to this automation rule.");
  }
  return {
    ...rule,
    conditions: await getAutomationRuleConditions(rule.id),
    actions: await getAutomationRuleActions(rule.id),
  };
}

export async function createAutomationRuleRecord(payload, user) {
  await assertAutomationTargetAccess(payload, user);

  const rule = await createAutomationRule(
    {
      userId: user.id,
      roomId: payload.roomId || null,
      applianceId: payload.applianceId || null,
      name: payload.name,
      description: payload.description || null,
      isEnabled: payload.isEnabled ?? true,
      priority: payload.priority || 1,
      scope: payload.scope,
      logicalOperator: payload.logicalOperator || "ALL",
    },
  );

  await replaceAutomationConditionsAndActions(rule.id, payload.conditions || [], payload.actions || []);
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created automation rule ${rule.name}`,
    moduleName: "Automation",
    entityType: "automation_rule",
    entityId: rule.id,
  });

  return getAutomationRuleById(rule.id, user);
}

export async function updateAutomationRuleRecord(id, payload, user) {
  const existingRule = await getAutomationRuleById(id, user);

  if (payload.roomId || payload.applianceId) {
    await assertAutomationTargetAccess(
      {
        roomId: payload.roomId || existingRule.roomId,
        applianceId: payload.applianceId || existingRule.applianceId,
      },
      user,
    );
  }

  const updatedRule = await updateAutomationRule(id, payload);

  if (payload.conditions || payload.actions) {
    await replaceAutomationConditionsAndActions(
      id,
      payload.conditions || existingRule.conditions,
      payload.actions || existingRule.actions,
    );
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated automation rule ${updatedRule.name}`,
    moduleName: "Automation",
    entityType: "automation_rule",
    entityId: id,
  });

  return getAutomationRuleById(id, user);
}

export async function deleteAutomationRuleRecord(id, user) {
  const rule = await getAutomationRuleById(id, user);
  const deleted = await deleteAutomationRule(id);
  if (!deleted) throw new ApiError(404, "Automation rule not found.");
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Deleted automation rule ${rule.name}`,
    moduleName: "Automation",
    entityType: "automation_rule",
    entityId: id,
  });
  return { deleted: true };
}

export async function getAutomationHistory(user) {
  const logs = await listActivityLogs(100);
  return logs.filter(
    (item) => item.moduleName === "Automation" && (user.role === "admin" || item.userId === user.id),
  );
}
