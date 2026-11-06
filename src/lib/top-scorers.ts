export const scorerYears = [
  { year: 2023, posters: 1, width: 945, height: 1181, leadingScore: 342, student: 'Saliu Hajara Nasiru' },
  { year: 2024, posters: 5, width: 1620, height: 2026, leadingScore: 347, student: 'Assiak M. O.' },
  { year: 2025, posters: 6, width: 1080, height: 1149, leadingScore: 368, student: 'Jonathan Kayla' },
  { year: 2026, posters: 7, width: 945, height: 1294, leadingScore: 361, student: 'Dominic Azubike' },
] as const;

export const scorerPosters = scorerYears.flatMap((group) =>
  Array.from({ length: group.posters }, (_, index) => ({
    ...group,
    number: index + 1,
    src: `/testimonials/top-scorers/${group.year}-${String(index + 1).padStart(2, '0')}.webp`,
    alt: `BJOT ${group.year} UTME top scorers, honours board ${index + 1} of ${group.posters}`,
  })),
);
