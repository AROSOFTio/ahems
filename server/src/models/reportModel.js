import { execute, query, queryOne, withTransaction } from "../config/db.js";

const reportSelect = `
  SELECT
    r.id,
    r.user_id,
    r.report_type,
    r.title,
    r.filters_json,
    r.status,
    r.file_path,
    r.generated_at,
    r.created_at,
    r.updated_at
  FROM reports r
`;

export async function listReportsForUser(user) {
  if (user.role === "admin") {
    return query(`${reportSelect} ORDER BY r.created_at DESC`);
  }

  return query(`${reportSelect} WHERE r.user_id = ? ORDER BY r.created_at DESC`, [user.id]);
}

export async function createReportWithExport({ userId, reportType, title, filtersJson = null, format = "CSV" }) {
  return withTransaction(async (executor) => {
    const result = await executor.execute(
      `
        INSERT INTO reports (user_id, report_type, title, filters_json, status, generated_at)
        VALUES (?, ?, ?, ?, 'READY', NOW())
      `,
      [userId, reportType, title, filtersJson ? JSON.stringify(filtersJson) : null],
    );

    const generatedReport = await executor.queryOne(`${reportSelect} WHERE r.id = ? LIMIT 1`, [result.insertId]);
    const extension = format.toLowerCase();
    const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}.${extension}`;

    const exportResult = await executor.execute(
      `
        INSERT INTO report_exports (report_id, exported_by, export_format, file_name, file_path, exported_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [result.insertId, userId, format, fileName, `/exports/${fileName}`],
    );

    const generatedExport = await executor.queryOne(
      `
        SELECT
          re.id,
          re.report_id,
          re.exported_by,
          re.export_format,
          re.file_name,
          re.file_path,
          re.exported_at,
          re.created_at
        FROM report_exports re
        WHERE re.id = ?
        LIMIT 1
      `,
      [exportResult.insertId],
    );

    return {
      report: generatedReport,
      export: generatedExport,
    };
  });
}

export async function listReportExports(user) {
  if (user.role === "admin") {
    return query(
      `
        SELECT
          re.id,
          re.report_id,
          re.exported_by,
          re.export_format,
          re.file_name,
          re.file_path,
          re.exported_at,
          re.created_at,
          r.title AS report_title
        FROM report_exports re
        INNER JOIN reports r ON r.id = re.report_id
        ORDER BY re.exported_at DESC
      `,
    );
  }

  return query(
    `
      SELECT
        re.id,
        re.report_id,
        re.exported_by,
        re.export_format,
        re.file_name,
        re.file_path,
        re.exported_at,
        re.created_at,
        r.title AS report_title
      FROM report_exports re
      INNER JOIN reports r ON r.id = re.report_id
      WHERE r.user_id = ?
      ORDER BY re.exported_at DESC
    `,
    [user.id],
  );
}

export async function countReports() {
  const row = await queryOne("SELECT COUNT(*) AS total_reports FROM reports");
  return row?.totalReports ?? 0;
}
