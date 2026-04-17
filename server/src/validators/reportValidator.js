export function validateReportGeneration(req) {
  const errors = [];

  if (!req.body.reportType) {
    errors.push("Report type is required.");
  }

  if (req.body.format && !["CSV", "PDF"].includes(req.body.format)) {
    errors.push("Report format must be CSV or PDF.");
  }

  return errors;
}
