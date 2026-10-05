export function scoreMemeRange(percentage: number): string {
  const score = Number.isFinite(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0;
  const lower = Math.min(90, Math.floor(score / 10) * 10);
  return `${lower}-${lower + 10}`;
}

const legacyMemes = [
  { below: 50, sources: ["/memes/0-40.jpg", "/memes/0-40-1.jpg", "/memes/0-40-2.jpg"] },
  { below: 65, sources: ["/memes/50-65.jpg"] },
  { below: 75, sources: ["/memes/65-75.jpg"] },
  { below: 90, sources: ["/memes/75-80.jpg"] },
  { below: 95, sources: ["/memes/90-100.jpg"] },
  { below: Infinity, sources: ["/memes/95-100.jpg"] },
];

export function legacyScoreMemes(percentage: number): string[] {
  return (legacyMemes.find((item) => percentage < item.below) ?? legacyMemes[0]).sources;
}
