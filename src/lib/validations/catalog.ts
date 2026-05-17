import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ فقط باید شامل حروف لاتین کوچک، عدد و خط تیره باشد.");

export const categoryCreateSchema = z.object({
  slug: slugSchema,
  nameFa: z.string().trim().min(2).max(120),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const productImageSchema = z.object({
  url: z.string().trim().min(1).max(500),
  altFa: z.string().trim().max(180).default(""),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  isPrimary: z.boolean().default(false),
});

export const productCreateSchema = z.object({
  slug: slugSchema,
  sku: z.string().trim().max(80).optional().nullable(),
  titleFa: z.string().trim().min(2).max(180),
  descriptionFa: z.string().trim().max(4000).default(""),
  priceMinor: z.coerce.number().int().min(0),
  compareAtMinor: z.coerce.number().int().min(0).optional().nullable(),
  weightGrams: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  metaTitleFa: z.string().trim().max(180).optional().nullable(),
  metaDescFa: z.string().trim().max(320).optional().nullable(),
  categoryId: z.string().min(1),
  inventory: z
    .object({
      quantityOnHand: z.coerce.number().int().min(0).default(0),
      quantityReserved: z.coerce.number().int().min(0).default(0),
      lowStockThreshold: z.coerce.number().int().min(0).default(3),
    })
    .default({ quantityOnHand: 0, quantityReserved: 0, lowStockThreshold: 3 }),
  images: z.array(productImageSchema).max(12).default([]),
});

export const productUpdateSchema = productCreateSchema.partial();

export const catalogListQuerySchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  includeInactive: z.coerce.boolean().default(false),
});

export const adminProductListSchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.string().trim().optional(),
  isFeatured: z
    .enum(["all", "yes", "no"])
    .optional()
    .default("all"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});

export type AdminProductListInput = z.infer<typeof adminProductListSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
