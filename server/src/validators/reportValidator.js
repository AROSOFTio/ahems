export function validateReportGeneration(req) {
  return !req.body.reportType ? ["Report type is required."] : [];
}

