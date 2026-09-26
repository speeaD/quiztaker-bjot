export type RegistrationSubject = { _id: string; title: string };

export function isEnglishSubject(title: string): boolean {
  return /^(?:use of english|english(?: language)?)$/.test(title.trim().toLowerCase().replace(/\s+/g, " "));
}

// Support both the Prisma API's id and the legacy MongoDB API's _id.
export function normalizeRegistrationSubjects(value: unknown): RegistrationSubject[] {
  if (!Array.isArray(value)) throw new Error("Invalid subject list");
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid subject");
    const subject = item as Record<string, unknown>;
    const id = subject.id ?? subject._id;
    if (typeof id !== "string" || !id.trim() || ids.has(id) ||
        typeof subject.title !== "string" || !subject.title.trim()) {
      throw new Error("Invalid subject");
    }
    ids.add(id);
    return { _id: id, title: subject.title };
  });
}

export function validRegistrationCombination(ids: unknown, subjects: RegistrationSubject[]): ids is string[] {
  if (!Array.isArray(ids) || ids.length !== 4 ||
      !ids.every((id) => typeof id === "string" && id.trim()) || new Set(ids).size !== 4) return false;
  const selected = subjects.filter((subject) => ids.includes(subject._id));
  return selected.length === 4 && selected.filter((subject) => isEnglishSubject(subject.title)).length === 1;
}
