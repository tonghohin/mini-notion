"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { textBlockStyleConfig } from "@/config/textBlockStyles"
import { createBlock, deleteBlockApi, updateBlockApi } from "@/lib/api-client"
import { Block, ImageBlock as ImageBlockType, TextBlockStyle, TextBlockStyleSchema, TextBlock as TextBlockType } from "@/types/block"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { ImageBlock } from "./image-block"
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

    async function createEmptyImageBlock() {
        const blockToCreate = {
            type: "image" as const,
            height: 300,
            width: 400,
            url: "",
            order: blocks.length,
        }

        try {
            const createdBlock = await createBlock(blockToCreate)
            setBlocks((prevBlocks) => [...prevBlocks, createdBlock])
        } catch (error) {
            console.error("Failed to create image block:", error)
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

    async function handleImageBlockUpdate(id: string, updates: Partial<Pick<ImageBlockType, "url" | "width" | "height">>) {
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
            console.error("Failed to update image block:", error)
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
            <CardContent className="flex flex-1 flex-col gap-4 overflow-scroll">
                {blocks.map((block) => (
                    <div key={block.id} className="group flex">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <PlusIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Basic Blocks</DropdownMenuLabel>
                                {TextBlockStyleSchema.options.map((style) => (
                                    <DropdownMenuItem key={style} onClick={() => createEmptyTextBlock(style, true, block.id)}>
                                        {textBlockStyleConfig[style].label}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Media</DropdownMenuLabel>
                                <DropdownMenuItem onClick={createEmptyImageBlock}>Image</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {block.type === "text" && <TextBlock block={block} onUpdate={handleTextBlockUpdate} onAddBlock={(blockId) => createEmptyTextBlock("p", true, blockId)} onDelete={handleBlockDelete} />}
                        {block.type === "image" && <ImageBlock block={block} onUpdate={handleImageBlockUpdate} onDelete={handleBlockDelete} />}
                    </div>
                ))}
                <div className="flex-1" onClick={() => createEmptyTextBlock()} />
            </CardContent>
        </Card>
    )
}
