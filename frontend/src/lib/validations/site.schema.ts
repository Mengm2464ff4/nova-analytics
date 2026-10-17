import { z } from "zod";

export const siteCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name is too long"),
  domain: z
    .string()
    .min(3, "Domain is required")
    .transform((v) => v.replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .refine((v) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v), {
      message: "Enter a valid domain (e.g. example.com)",
    }),
});

export type SiteCreateSchema = z.infer<typeof siteCreateSchema>;