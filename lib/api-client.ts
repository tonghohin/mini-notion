import { Block, ImageBlock, TextBlock } from "@/types/block"

const API_BASE = "/api/blocks"

export async function fetchBlocks(): Promise<Block[]> {
    const response = await fetch(API_BASE)
    if (!response.ok) {
        throw new Error("Failed to fetch blocks")
    }
    const data = await response.json()
    return data.blocks
}

export async function createBlock(block: Omit<Block, "id" | "createdAt" | "updatedAt">): Promise<Block> {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(block),
    })
    if (!response.ok) {
        throw new Error("Failed to create block")
    }
    const data = await response.json()
    return data.block
}

export async function updateBlockApi(id: string, updates: Partial<Pick<TextBlock, "content" | "style" | "order"> | Pick<ImageBlock, "url" | "width" | "height" | "order">>): Promise<Block> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    })
    if (!response.ok) {
        throw new Error("Failed to update block")
    }
    const data = await response.json()
    return data.block
}

export async function deleteBlockApi(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    })
    if (!response.ok) {
        throw new Error("Failed to delete block")
    }
}

export async function reorderBlocks(blockIds: string[]): Promise<void> {
    const updates = blockIds.map((id, index) => updateBlockApi(id, { order: index }))
    await Promise.all(updates)
}
