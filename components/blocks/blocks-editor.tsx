"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateBlockApi } from "@/lib/api-client"
import { Block, TextBlock as TextBlockType } from "@/types/block"
import { useState } from "react"
import { TextBlock } from "./text-block"

export function BlocksEditor({ initialBlocks }: { initialBlocks: Block[] }) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

    async function handleTextBlockUpdate(id: string, updates: Partial<Pick<TextBlockType, "content" | "style">>) {
        const blockIndex = blocks.findIndex((block) => block.id === id)
        if (blockIndex === -1) return

        // Optimistic update
        const updatedBlock = { ...blocks[blockIndex], ...updates }
        setBlocks((prevBlocks) => [...prevBlocks.slice(0, blockIndex), updatedBlock, ...prevBlocks.slice(blockIndex + 1)])

        try {
            await updateBlockApi(id, updates)
        } catch (error) {
            // Revert on error
            setBlocks((prevBlocks) => [...prevBlocks.slice(0, blockIndex), blocks[blockIndex], ...prevBlocks.slice(blockIndex + 1)])
            console.error("Failed to update text block:", error)
        }
    }

    return (
        <Card className="flex-1 px-8">
            <CardHeader>
                <CardTitle>Mini Notion</CardTitle>
                <CardDescription>Click to add a block.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
                {blocks.map((block) => (
                    <div key={block.id}>
                        {block.type === "text" && <TextBlock block={block} onUpdate={handleTextBlockUpdate} />}
                        {block.type === "image" && null}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
