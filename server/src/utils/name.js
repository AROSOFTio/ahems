export function splitFullName(fullName) {
  const normalized = (fullName || "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : "-",
  };
}

export function combineFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
