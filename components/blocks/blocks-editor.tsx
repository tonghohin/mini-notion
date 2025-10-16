"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBlock, deleteBlockApi, updateBlockApi } from "@/lib/api-client"
import { Block, TextBlockStyle, TextBlock as TextBlockType } from "@/types/block"
import { useState } from "react"
import { TextBlock } from "./text-block"

export function BlocksEditor({ initialBlocks }: { initialBlocks: Block[] }) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

    async function createEmptyTextBlock(style: TextBlockStyle = "p", isForceCreate: boolean = false, blockId?: string) {
        if (!isForceCreate) {
            const lastBlock = blocks[blocks.length - 1]
            if (lastBlock && lastBlock.type === "text" && lastBlock.content === "") return
        }

        const insertIndex = blockId ? blocks.findIndex((block) => block.id === blockId) + 1 : blocks.length

        const blockToCreate = {
            type: "text" as const,
            content: "",
            style,
            order: insertIndex,
        }

        try {
            const createdBlock = await createBlock(blockToCreate)

            if (!blockId) {
                setBlocks((prevBlocks) => [...prevBlocks, createdBlock])
            } else {
                const blockIndex = blocks.findIndex((block) => block.id === blockId)
                if (blockIndex === -1) return

                setBlocks((prevBlocks) => [...prevBlocks.slice(0, blockIndex + 1), createdBlock, ...prevBlocks.slice(blockIndex + 1)])
            }
        } catch (error) {
            console.error("Failed to create text block:", error)
        }
    }

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

    async function handleBlockDelete(id: string) {
        const blockIndex = blocks.findIndex((block) => block.id === id)
        if (blockIndex === -1) return

        const deletedBlock = blocks[blockIndex]

        // Optimistic delete
        setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id))

        try {
            await deleteBlockApi(id)
        } catch (error) {
            // Revert on error
            setBlocks((prevBlocks) => [...prevBlocks.slice(0, blockIndex), deletedBlock, ...prevBlocks.slice(blockIndex)])
            console.error("Failed to delete block:", error)
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
                        {block.type === "text" && <TextBlock block={block} onUpdate={handleTextBlockUpdate} onAddBlock={(blockId) => createEmptyTextBlock("p", true, blockId)} onDelete={handleBlockDelete} />}
                        {block.type === "image" && null}
                    </div>
                ))}
                <div className="flex-1" onClick={() => createEmptyTextBlock()} />
            </CardContent>
        </Card>
    )
}
