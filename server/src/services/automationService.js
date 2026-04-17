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
import { createActivityLog } from "../models/activityLogModel.js";
import { createAutomationRuleRun, listAutomationRuleRuns } from "../models/automationRunModel.js";
import { findApplianceById, listAppliancesForUser } from "../models/applianceModel.js";
import { createDeviceCommand } from "../models/deviceCommandModel.js";
import { createNotification as createNotificationRecord } from "../models/notificationModel.js";
import { findRoomById, listRoomAppliances, listRoomsForUser, userHasRoomAccess } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";
import { applyActionToAppliance, extractBrightnessLevel, resolveCommandAction } from "./deviceControlService.js";
import { accumulateApplianceEnergy } from "./energyService.js";

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

function compareValues(operator, leftValue, rightValue) {
  const leftNumber = Number(leftValue);
  const rightNumber = Number(rightValue);
  const useNumeric = !Number.isNaN(leftNumber) && !Number.isNaN(rightNumber);

  const left = useNumeric ? leftNumber : String(leftValue ?? "").toUpperCase();
  const right = useNumeric ? rightNumber : String(rightValue ?? "").toUpperCase();

  switch (operator) {
    case "GT":
      return left > right;
    case "LT":
      return left < right;
    case "GTE":
      return left >= right;
    case "LTE":
      return left <= right;
    case "NEQ":
      return left !== right;
    case "IN":
      return String(rightValue ?? "")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .includes(String(leftValue ?? "").toUpperCase());
    case "EQ":
    default:
      return left === right;
  }
}

function resolveConditionValue(condition, context) {
  switch (condition.metric) {
    case "TEMPERATURE":
      return context.room?.currentTemperature;
    case "LIGHT":
      return context.room?.currentLightLevel;
    case "OCCUPANCY":
      return context.room?.occupancyState;
    case "TIME_OF_DAY":
      return context.timeOfDay;
    case "ENERGY_USAGE":
      if (context.appliance) {
        return context.appliance.estimatedEnergyKwh;
      }

      return context.roomAppliances.reduce((sum, appliance) => sum + Number(appliance.estimatedEnergyKwh || 0), 0);
    case "DEVICE_STATUS":
      return context.appliance?.status || context.roomAppliances[0]?.status || "OFF";
    default:
      return null;
  }
}

async function buildRuleContext(rule) {
  const room = rule.roomId ? await findRoomById(rule.roomId) : null;
  const roomAppliances = room ? await listRoomAppliances(room.id) : [];
  const appliance =
    rule.applianceId
      ? roomAppliances.find((item) => item.id === rule.applianceId) || (await findApplianceById(rule.applianceId))
      : null;

  const currentHour = new Date().getHours();
  const timeOfDay =
    currentHour >= 18 ? "EVENING" : currentHour >= 12 ? "AFTERNOON" : currentHour >= 6 ? "MORNING" : "NIGHT";

  return {
    room,
    appliance,
    roomAppliances,
    timeOfDay,
  };
}

async function executeRuleActions(rule, context, triggerSource, triggeredByUserId) {
  const actions = await getAutomationRuleActions(rule.id);
  const results = [];

  for (const action of actions) {
    if (action.actionType === "SEND_NOTIFICATION") {
      const notification = await createNotificationRecord({
        userId: context.room?.ownerUserId || rule.ownerUserId || null,
        roomId: context.room?.id || rule.roomId || null,
        applianceId: context.appliance?.id || rule.applianceId || null,
        type: "RULE_TRIGGERED",
        title: `Rule triggered: ${rule.name}`,
        message:
          action.actionValue ||
          `${rule.name} executed automatically in ${context.room?.name || "the selected scope"}.`,
        severity: "INFO",
      });

      results.push({
        actionType: action.actionType,
        notificationId: notification.id,
      });
      continue;
    }

    const targetAppliances = rule.applianceId
      ? context.roomAppliances.filter((item) => item.id === rule.applianceId)
      : context.roomAppliances;

    for (const appliance of targetAppliances) {
      const updatedAppliance = await applyActionToAppliance(appliance, {
        actionType: action.actionType,
        actionValue: action.actionValue,
        brightnessLevel: extractBrightnessLevel({ actionValue: action.actionValue }),
      });

      const command = await createDeviceCommand({
        userId: triggeredByUserId || null,
        roomId: updatedAppliance.roomId,
        applianceId: updatedAppliance.id,
        commandSource: "AUTOMATION",
        commandText: `${rule.name}: ${action.actionType}`,
        commandPayload: {
          ruleId: rule.id,
          actionType: action.actionType,
          actionValue: action.actionValue,
        },
        executedAction: resolveCommandAction({ actionType: action.actionType }),
        status: "SUCCESS",
      });

      const runtimeMinutes =
        action.actionType === "TURN_ON"
          ? 45
          : action.actionType === "DIM"
            ? 30
            : action.actionType === "RESTORE_BRIGHTNESS"
              ? 40
              : action.actionType === "SET_MODE_AUTO"
                ? 20
                : 10;

      await accumulateApplianceEnergy(updatedAppliance, {
        runtimeMinutes,
        source: "RULE_ENGINE",
        timeOfDay: context.timeOfDay,
      });

      results.push({
        actionType: action.actionType,
        applianceId: updatedAppliance.id,
        applianceName: updatedAppliance.name,
        commandId: command.id,
      });
    }
  }

  if (results.length) {
    await createNotificationRecord({
      userId: context.room?.ownerUserId || rule.ownerUserId || null,
      roomId: context.room?.id || rule.roomId || null,
      applianceId: context.appliance?.id || rule.applianceId || null,
      type: "RULE_TRIGGERED",
      title: `Automation executed: ${rule.name}`,
      message: `${rule.name} executed ${results.length} action(s) after matching its configured conditions.`,
      severity: "SUCCESS",
    });
  }

  return results;
}

async function evaluateRule(rule, triggerSource = "SYSTEM", triggeredByUserId = null) {
  const context = await buildRuleContext(rule);
  const conditions = await getAutomationRuleConditions(rule.id);
  const evaluations = conditions.map((condition) => {
    const actualValue = resolveConditionValue(condition, context);
    const matched = compareValues(condition.operator, actualValue, condition.comparisonValue);

    return {
      id: condition.id,
      metric: condition.metric,
      operator: condition.operator,
      expected: condition.comparisonValue,
      actualValue,
      matched,
    };
  });

  const isMatch =
    rule.logicalOperator === "ANY" ? evaluations.some((item) => item.matched) : evaluations.every((item) => item.matched);

  if (!isMatch) {
    return {
      matched: false,
      evaluations,
      actions: [],
      context,
    };
  }

  const actions = await executeRuleActions(rule, context, triggerSource, triggeredByUserId);
  return {
    matched: true,
    evaluations,
    actions,
    context,
  };
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

  const rule = await createAutomationRule({
    userId: user.id,
    roomId: payload.roomId || null,
    applianceId: payload.applianceId || null,
    name: payload.name,
    description: payload.description || null,
    isEnabled: payload.isEnabled ?? true,
    priority: payload.priority || 1,
    scope: payload.scope,
    logicalOperator: payload.logicalOperator || "ALL",
  });

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

export async function setAutomationRuleEnabledState(id, isEnabled, user) {
  await getAutomationRuleById(id, user);

  const updated = await updateAutomationRule(id, { isEnabled });
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `${isEnabled ? "Enabled" : "Disabled"} automation rule ${updated.name}`,
    moduleName: "Automation",
    entityType: "automation_rule",
    entityId: id,
  });

  return getAutomationRuleById(id, user);
}

export async function executeAutomationRulesForRoom({ roomId, triggerSource = "SYSTEM", triggeredByUserId = null } = {}) {
  const rules = await listAutomationRules();
  const eligibleRules = [];

  for (const rule of rules.filter((item) => item.isEnabled)) {
    if (!roomId || rule.scope === "SYSTEM" || rule.roomId === Number(roomId)) {
      eligibleRules.push(rule);
      continue;
    }

    if (rule.applianceId) {
      const appliance = await findApplianceById(rule.applianceId);

      if (appliance?.roomId === Number(roomId)) {
        eligibleRules.push(rule);
      }
    }
  }

  eligibleRules.sort((left, right) => Number(left.priority) - Number(right.priority));

  const runs = [];

  for (const rule of eligibleRules) {
    try {
      const result = await evaluateRule(rule, triggerSource, triggeredByUserId);

      if (!result.matched) {
        continue;
      }

      const run = await createAutomationRuleRun({
        ruleId: rule.id,
        roomId: result.context.room?.id || rule.roomId || null,
        applianceId: result.context.appliance?.id || rule.applianceId || null,
        triggeredByUserId,
        triggerSource,
        status: "TRIGGERED",
        matchedConditions: result.evaluations,
        executedActions: result.actions,
      });

      await createActivityLog({
        userId: triggeredByUserId || null,
        actorRole: triggeredByUserId ? "user" : "system",
        action: `Automation rule ${rule.name} triggered`,
        moduleName: "Automation",
        entityType: "automation_rule_run",
        entityId: run?.id || null,
        metadata: {
          ruleId: rule.id,
          roomId: result.context.room?.id || null,
          actionCount: result.actions.length,
        },
      });

      runs.push(run);
    } catch (error) {
      const failureRun = await createAutomationRuleRun({
        ruleId: rule.id,
        roomId: rule.roomId || roomId || null,
        applianceId: rule.applianceId || null,
        triggeredByUserId,
        triggerSource,
        status: "FAILED",
        errorMessage: error.message,
      });

      runs.push(failureRun);
    }
  }

  return runs.filter(Boolean);
}

export async function getAutomationHistory(user) {
  let roomIds = null;

  if (user.role !== "admin") {
    const rooms = await listRoomsForUser(user);
    roomIds = rooms.map((room) => room.id);
  }

  return listAutomationRuleRuns({
    roomIds,
    limit: 80,
  });
}
