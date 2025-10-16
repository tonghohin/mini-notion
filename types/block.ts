import { z } from "zod"

const BaseBlockSchema = z.object({
    id: z.uuid(),
    order: z.number().int().min(0),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export const TextBlockStyleSchema = z.enum(["h1", "h2", "h3", "p"])
export type TextBlockStyle = z.infer<typeof TextBlockStyleSchema>

const TextBlockSchema = BaseBlockSchema.extend({
    type: z.literal("text"),
    content: z.string(),
    style: TextBlockStyleSchema,
})
export type TextBlock = z.infer<typeof TextBlockSchema>

const ImageBlockSchema = BaseBlockSchema.extend({
    type: z.literal("image"),
    url: z.coerce.string().trim(),
    width: z.number().int().positive().max(2000),
    height: z.number().int().positive().max(2000),
})
export type ImageBlock = z.infer<typeof ImageBlockSchema>

export const BlockSchema = z.discriminatedUnion("type", [TextBlockSchema, ImageBlockSchema])
export type Block = z.infer<typeof BlockSchema>

export const BlockIdParamSchema = z.uuid()
export type BlockIdParam = z.infer<typeof BlockIdParamSchema>

export const BlocksDataSchema = z.object({
    blocks: BlockSchema.array(),
})
export type BlocksData = z.infer<typeof BlocksDataSchema>

// Create
export const CreateTextBlockSchema = z.object({
    type: z.literal("text"),
    content: z.string().default(""),
    style: TextBlockStyleSchema.default("p"),
    order: z.number().int().min(0).optional(),
})

export const CreateImageBlockSchema = z.object({
    type: z.literal("image"),
    url: z.coerce.string().trim(),
    width: z.number().int().positive().max(2000).default(400),
    height: z.number().int().positive().max(2000).default(300),
    order: z.number().int().min(0).optional(),
})

export const CreateBlockSchema = z.discriminatedUnion("type", [CreateTextBlockSchema, CreateImageBlockSchema])
export type CreateBlockDto = z.infer<typeof CreateBlockSchema>

// Patch
export const UpdateTextBlockSchema = z
    .object({
        content: z.string().optional(),
        style: TextBlockStyleSchema.optional(),
        order: z.number().int().min(0).optional(),
    })
    .strict()

export const UpdateImageBlockSchema = z
    .object({
        url: z.coerce.string().trim().optional(),
        width: z.number().int().positive().max(2000).optional(),
        height: z.number().int().positive().max(2000).optional(),
        order: z.number().int().min(0).optional(),
    })
    .strict()

export const UpdateBlockSchema = z.union([UpdateTextBlockSchema, UpdateImageBlockSchema])
export type UpdateBlockDto = z.infer<typeof UpdateBlockSchema>

// Reorder
export const ReorderBlocksSchema = z.object({
    orderedIds: z.uuid().array().min(1),
})
