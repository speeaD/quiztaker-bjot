export type Track = "Science" | "Art & Commercial";

export const pricing = {
  Science: {
    foundation: { lite: 9000, pro: 10000 },
    advanced: { lite: 17000, pro: 18000 },
    ultimate: { lite: 25000, pro: 27000 },
    max: 35000,
  },
  "Art & Commercial": {
    foundation: { lite: 8000, pro: 9000 },
    advanced: { lite: 15000, pro: 16000 },
    ultimate: { lite: 23000, pro: 24000 },
    max: 30000,
  },
} as const;

export const tierDetails = [
  { key: "foundation", name: "Foundation", duration: "1 month", features: ["1 month of intensive classes", "Biweekly mock exams", "Data support", "Video tutorials", "Recommended JAMB textbook list"] },
  { key: "advanced", name: "Advanced", duration: "2 months", features: ["2 months of intensive classes", "Biweekly mock exams", "Data support", "Video tutorials", "Recommended JAMB textbook list"] },
  { key: "ultimate", name: "Ultimate", duration: "3 months", features: ["3 months of intensive classes", "Biweekly mock exams", "Data support", "Video tutorials", "Recommended JAMB textbook list"] },
] as const;

export const proExtra = "Access to BJOT JAMB CBT practice";

export const scienceMaxFeatures = [
  "Full tutorial period until JAMB starts",
  "Everything in Ultimate Pro",
  "3 days of Organic Chemistry classes",
  "3 days of Physics bootcamp",
  "Final revision class",
  "Organic Chemistry manual (PDF)",
  "Physics formula bank",
  "English marathon class",
] as const;

export const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
