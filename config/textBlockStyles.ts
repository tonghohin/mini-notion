import { TextBlockStyle } from "@/types/block"

export const textBlockStyleConfig: Record<TextBlockStyle, { tag: string; className: string; label: string }> = {
    h1: { tag: "h1", className: "text-4xl font-bold", label: "Heading 1" },
    h2: { tag: "h2", className: "text-3xl font-bold", label: "Heading 2" },
    h3: { tag: "h3", className: "text-2xl font-bold", label: "Heading 3" },
    p: { tag: "p", className: "text-sm", label: "Text" },
} as const
