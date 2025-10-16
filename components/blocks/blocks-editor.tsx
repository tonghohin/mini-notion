"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { textBlockStyleConfig } from "@/config/textBlockStyles"
import { createBlock, deleteBlockApi, reorderBlocks, updateBlockApi } from "@/lib/api-client"
import { Block, ImageBlock as ImageBlockType, TextBlockStyle, TextBlockStyleSchema, TextBlock as TextBlockType } from "@/types/block"
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical, PlusIcon } from "lucide-react"
import { useState } from "react"
import { DraggableItem } from "./draggable-item"
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

    async function createEmptyImageBlock(blockId: string) {
        const insertIndex = blockId ? blocks.findIndex((block) => block.id === blockId) + 1 : blocks.length

        const blockToCreate = {
            type: "image" as const,
            height: 300,
            width: 400,
            url: "",
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) {
            return
        }

        const oldIndex = blocks.findIndex((block) => block.id === active.id)
        const newIndex = blocks.findIndex((block) => block.id === over.id)

        const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex)
        const blocksWithNewOrder = reorderedBlocks.map((block, index) => ({ ...block, order: index }))

        // Optimistic update
        setBlocks(blocksWithNewOrder)

        try {
            await reorderBlocks(blocksWithNewOrder.map((block) => block.id))
        } catch (error) {
            // Revert on error
            setBlocks(blocks)
            console.error("Failed to reorder blocks:", error)
        }
    }

    return (
        <Card className="flex-1 px-8">
            <CardHeader>
                <CardTitle>Mini Notion</CardTitle>
                <CardDescription>Click to add a block.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 overflow-scroll">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
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
                                        <DropdownMenuItem onClick={() => createEmptyImageBlock(block.id)}>Image</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {block.type === "text" && (
                                    <DraggableItem id={block.id}>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon-sm" className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <GripVertical />
                                            </Button>
                                            <TextBlock block={block} onUpdate={handleTextBlockUpdate} onAddBlock={(blockId) => createEmptyTextBlock("p", true, blockId)} onDelete={handleBlockDelete} />
                                        </div>
                                    </DraggableItem>
                                )}
                                {block.type === "image" && (
                                    <DraggableItem id={block.id}>
                                        <div className="relative flex gap-2">
                                            <Button variant="ghost" size="icon-sm" className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <GripVertical />
                                            </Button>
                                            <ImageBlock block={block} onUpdate={handleImageBlockUpdate} onDelete={handleBlockDelete} />
                                        </div>
                                    </DraggableItem>
                                )}
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>
                <div className="flex-1" onClick={() => createEmptyTextBlock()} />
            </CardContent>
        </Card>
    )
}
