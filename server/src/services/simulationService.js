import { execute, query } from "../config/db.js";
import { createActivityLog } from "../models/activityLogModel.js";
import { listAppliancesForUser } from "../models/applianceModel.js";
import { listRecentDeviceCommands, listRecentDeviceCommandsForRooms, createDeviceCommand } from "../models/deviceCommandModel.js";
import { findRoomById, listRoomAppliances, listRoomsForUser, userHasRoomAccess } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";
import { evaluateRoomAlerts } from "./alertService.js";
import { executeAutomationRulesForRoom } from "./automationService.js";
import { applyActionToAppliance, resolveCommandAction } from "./deviceControlService.js";
import { accumulateApplianceEnergy } from "./energyService.js";

function nudgeValue(value, min, max) {
  const next = value + (Math.random() * 2 - 1) * 2;
  return Math.max(min, Math.min(max, Number(next.toFixed(1))));
}

async function createSensorReading(roomId, readingType, readingValue, unit, source = "MANUAL") {
  await execute(
    `
      INSERT INTO sensor_readings (room_id, reading_type, reading_value, unit, source, recorded_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [roomId, readingType, readingValue, unit, source],
  );
}

async function resolveAccessibleRooms(user) {
  if (!user) {
    return [];
  }

  if (user.role === "admin") {
    return null;
  }

  return listRoomsForUser(user);
}

function buildRoomScopeClause(roomIds, columnName) {
  if (roomIds === null) {
    return {
      clause: "",
      params: [],
    };
  }

  if (!roomIds.length) {
    return {
      clause: "WHERE 1 = 0",
      params: [],
    };
  }

  return {
    clause: `WHERE ${columnName} IN (${roomIds.map(() => "?").join(", ")})`,
    params: roomIds,
  };
}

async function resolveTargetAppliances(payload, user) {
  const accessibleAppliances = await listAppliancesForUser(user);

  if (payload.applianceId) {
    const appliance = accessibleAppliances.find((item) => item.id === Number(payload.applianceId));
    return appliance ? [appliance] : [];
  }

  if (payload.roomId) {
    return accessibleAppliances.filter((item) => item.roomId === Number(payload.roomId));
  }

  return accessibleAppliances;
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

async function postRoomStateUpdate(roomId, userId = null, triggerSource = "SIMULATION") {
  const room = await findRoomById(roomId);
  const roomAppliances = await listRoomAppliances(roomId);

  await evaluateRoomAlerts(room, roomAppliances);
  await executeAutomationRulesForRoom({
    roomId,
    triggerSource,
    triggeredByUserId: userId,
  });
}

export async function getSimulationOverview(user) {
  const accessibleRooms = await resolveAccessibleRooms(user);
  const rooms =
    accessibleRooms === null
      ? await query(
          `
            SELECT
              r.id,
              r.owner_user_id,
              r.room_type_id,
              r.name,
              r.description,
              r.floor_level,
              r.occupancy_state,
              r.current_temperature,
              r.current_light_level,
              r.max_temperature_threshold,
              r.min_light_threshold,
              r.is_active,
              r.created_at,
              r.updated_at,
              rt.name AS room_type_name,
              CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
              u.email AS owner_email
            FROM rooms r
            INNER JOIN room_types rt ON rt.id = r.room_type_id
            INNER JOIN users u ON u.id = r.owner_user_id
            ORDER BY r.created_at DESC
          `,
        )
      : accessibleRooms;
  const roomIds = accessibleRooms === null ? null : accessibleRooms.map((room) => room.id);
  const conditionsScope = buildRoomScopeClause(roomIds, "sc.room_id");
  const readingsScope = buildRoomScopeClause(roomIds, "sr.room_id");
  const appliancesPromise = listAppliancesForUser(user);
  const commandsPromise =
    roomIds === null ? listRecentDeviceCommands(12) : listRecentDeviceCommandsForRooms(roomIds, 12);

  const [conditions, recentReadings, appliances, recentCommands] = await Promise.all([
    query(
      `
        SELECT
          sc.id,
          sc.room_id,
          sc.target_temperature,
          sc.target_light_intensity,
          sc.target_occupancy,
          sc.time_of_day,
          sc.randomization_enabled,
          sc.updated_by,
          sc.created_at,
          sc.updated_at,
          r.name AS room_name
        FROM simulated_conditions sc
        INNER JOIN rooms r ON r.id = sc.room_id
        ${conditionsScope.clause}
        ORDER BY sc.updated_at DESC
      `,
      conditionsScope.params,
    ),
    query(
      `
        SELECT
          sr.id,
          sr.room_id,
          sr.reading_type,
          sr.reading_value,
          sr.unit,
          sr.source,
          sr.recorded_at,
          sr.created_at,
          r.name AS room_name
        FROM sensor_readings sr
        INNER JOIN rooms r ON r.id = sr.room_id
        ${readingsScope.clause}
        ORDER BY sr.recorded_at DESC
        LIMIT 20
      `,
      readingsScope.params,
    ),
    appliancesPromise,
    commandsPromise,
  ]);

  return {
    rooms,
    conditions,
    recentReadings,
    appliances,
    recentCommands,
    summary: {
      totalRooms: rooms.length,
      occupiedRooms: rooms.filter((room) => room.occupancyState === "OCCUPIED").length,
      activeAppliances: appliances.filter((appliance) => ["ON", "DIMMED"].includes(appliance.status)).length,
    },
  };
}

export async function updateSimulatedConditions(payload, user) {
  const room = await assertRoomAccess(payload.roomId, user);

  await execute(
    `
      INSERT INTO simulated_conditions (
        room_id,
        target_temperature,
        target_light_intensity,
        target_occupancy,
        time_of_day,
        randomization_enabled,
        updated_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        target_temperature = VALUES(target_temperature),
        target_light_intensity = VALUES(target_light_intensity),
        target_occupancy = VALUES(target_occupancy),
        time_of_day = VALUES(time_of_day),
        randomization_enabled = VALUES(randomization_enabled),
        updated_by = VALUES(updated_by),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      payload.roomId,
      payload.targetTemperature ?? 22,
      payload.targetLightIntensity ?? 50,
      payload.targetOccupancy ?? "VACANT",
      payload.timeOfDay ?? "MORNING",
      payload.randomizationEnabled ? 1 : 0,
      user.id,
    ],
  );

  await execute(
    `
      UPDATE rooms
      SET
        current_temperature = ?,
        current_light_level = ?,
        occupancy_state = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.targetTemperature ?? room.currentTemperature,
      payload.targetLightIntensity ?? room.currentLightLevel,
      payload.targetOccupancy ?? room.occupancyState,
      payload.roomId,
    ],
  );

  await Promise.all([
    createSensorReading(payload.roomId, "TEMPERATURE", payload.targetTemperature ?? room.currentTemperature, "C", "MANUAL"),
    createSensorReading(payload.roomId, "LIGHT", payload.targetLightIntensity ?? room.currentLightLevel, "%", "MANUAL"),
    createSensorReading(
      payload.roomId,
      "OCCUPANCY",
      (payload.targetOccupancy ?? room.occupancyState) === "OCCUPIED" ? 1 : 0,
      "BOOLEAN",
      "MANUAL",
    ),
  ]);

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated simulated conditions for room ${room.name}`,
    moduleName: "Sensors",
    entityType: "simulated_condition",
    entityId: payload.roomId,
  });

  await postRoomStateUpdate(payload.roomId, user.id, "MANUAL");

  return getSimulationOverview(user);
}

export async function randomizeSimulation(roomId, user) {
  const room = await assertRoomAccess(roomId, user);

  const temperature = nudgeValue(room.currentTemperature, 18, 30);
  const lightLevel = nudgeValue(room.currentLightLevel, 15, 100);
  const occupancyState = room.occupancyState === "OCCUPIED" ? "VACANT" : "OCCUPIED";

  await execute(
    `
      UPDATE rooms
      SET
        current_temperature = ?,
        current_light_level = ?,
        occupancy_state = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [temperature, lightLevel, occupancyState, roomId],
  );

  await Promise.all([
    createSensorReading(roomId, "TEMPERATURE", temperature, "C", "RANDOMIZED"),
    createSensorReading(roomId, "LIGHT", lightLevel, "%", "RANDOMIZED"),
    createSensorReading(roomId, "OCCUPANCY", occupancyState === "OCCUPIED" ? 1 : 0, "BOOLEAN", "RANDOMIZED"),
  ]);

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Randomized simulation values for ${room.name}`,
    moduleName: "Sensors",
    entityType: "room",
    entityId: roomId,
  });

  await postRoomStateUpdate(roomId, user.id, "SIMULATION");

  return getSimulationOverview(user);
}

export async function runCommandSimulation(payload, user) {
  if (payload.roomId) {
    await assertRoomAccess(payload.roomId, user);
  }

  const targetAppliances = await resolveTargetAppliances(payload, user);

  if (!targetAppliances.length) {
    throw new ApiError(404, "No accessible appliances were found for this command.");
  }

  const updatedAppliances = [];
  const commandRecords = [];

  for (const appliance of targetAppliances) {
    const updatedAppliance = await applyActionToAppliance(appliance, payload);
    updatedAppliances.push(updatedAppliance);

    const commandRecord = await createDeviceCommand({
      userId: user.id,
      roomId: updatedAppliance.roomId,
      applianceId: updatedAppliance.id,
      commandSource: payload.commandSource || "TYPED",
      commandText: payload.commandText || payload.action || "Simulated command",
      commandPayload: payload,
      executedAction: resolveCommandAction(payload),
      status: "SUCCESS",
    });

    await accumulateApplianceEnergy(updatedAppliance, {
      runtimeMinutes:
        resolveCommandAction(payload) === "TURN_ON"
          ? 40
          : resolveCommandAction(payload) === "DIM"
            ? 25
            : resolveCommandAction(payload) === "SET_MODE_AUTO"
              ? 15
              : 10,
      source: "SIMULATION",
    });

    commandRecords.push(commandRecord);
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Executed ${payload.commandSource || "typed"} command across ${updatedAppliances.length} appliance(s)`,
    moduleName: "Commands",
    entityType: "device_command",
    metadata: {
      roomId: payload.roomId || null,
      applianceId: payload.applianceId || null,
      affectedApplianceIds: updatedAppliances.map((appliance) => appliance.id),
    },
  });

  const affectedRoomIds = [...new Set(updatedAppliances.map((appliance) => appliance.roomId))];
  for (const roomId of affectedRoomIds) {
    await postRoomStateUpdate(roomId, user.id, "COMMAND");
  }

  return {
    executedAction: resolveCommandAction(payload),
    affectedCount: updatedAppliances.length,
    updatedAppliances,
    commands: commandRecords,
    overview: await getSimulationOverview(user),
  };
}

export async function runAutomatedSimulationTick() {
  const rooms = await query(
    `
      SELECT id, current_temperature, current_light_level, occupancy_state
      FROM rooms
      WHERE is_active = 1
    `,
  );

  for (const room of rooms) {
    const nextTemperature = nudgeValue(room.currentTemperature, 18, 29);
    const nextLightLevel = nudgeValue(room.currentLightLevel, 15, 100);

    await execute(
      `
        UPDATE rooms
        SET current_temperature = ?, current_light_level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [nextTemperature, nextLightLevel, room.id],
    );

    await createSensorReading(room.id, "TEMPERATURE", nextTemperature, "C", "SCHEDULED");
    await createSensorReading(room.id, "LIGHT", nextLightLevel, "%", "SCHEDULED");

    const appliances = await listRoomAppliances(room.id);
    for (const appliance of appliances.filter((item) => ["ON", "DIMMED", "STANDBY"].includes(item.status))) {
      await accumulateApplianceEnergy(appliance, {
        runtimeMinutes: 10,
        source: "AUTO",
      });
    }

    await postRoomStateUpdate(room.id, null, "SCHEDULED");
  }

  return query(
    `
      SELECT id, room_id, reading_type, reading_value, unit, source, recorded_at, created_at
      FROM sensor_readings
      ORDER BY recorded_at DESC
      LIMIT 20
    `,
  );
}
