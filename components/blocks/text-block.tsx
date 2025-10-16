"use client"

import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { textBlockStyleConfig } from "@/config/textBlockStyles"
import { cn } from "@/lib/utils"
import { TextBlockStyle, TextBlockStyleSchema, TextBlock as TextBlockType } from "@/types/block"
import { useState } from "react"

export function TextBlock({ block, onUpdate, onAddBlock, onDelete }: { block: TextBlockType; onUpdate: (id: string, updates: Partial<Pick<TextBlockType, "content" | "style">>) => void; onAddBlock: (blockId: string) => void; onDelete: (blockId: string) => void }) {
    const [isToolbarOpen, setIsToolbarOpen] = useState(false)

    return (
        <Popover open={isToolbarOpen} onOpenChange={setIsToolbarOpen}>
            <PopoverAnchor asChild>
                <div className="flex-1">
                    <Input
                        autoFocus
                        type="text"
                        value={block.content}
                        className={cn("flex-1 border-none p-1 shadow-none focus-visible:border-none focus-visible:ring-0", textBlockStyleConfig[block.style].className)}
                        onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                        placeholder={textBlockStyleConfig[block.style].label}
                        onSelect={(e) => {
                            const input = e.currentTarget
                            const selectionLength = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0)
                            setIsToolbarOpen(selectionLength > 0)
                        }}
                        onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                onAddBlock(block.id)
                            } else if (e.key === "Backspace" && block.content === "") {
                                e.preventDefault()
                                onDelete(block.id)
                            }
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>
            </PopoverAnchor>
            <PopoverContent side="top" align="start" sideOffset={0} className="w-fit border-none p-0 shadow-none" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Select
                    value={block.style}
                    onValueChange={(value) => {
                        onUpdate(block.id, { style: value as TextBlockStyle })
                        setIsToolbarOpen(false)
                    }}>
                    <SelectTrigger size="sm" className="p-2">
                        <SelectValue placeholder={textBlockStyleConfig[block.style].label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Turns into</SelectLabel>
                            {TextBlockStyleSchema.options.map((style) => (
                                <SelectItem key={style} value={style}>
                                    {textBlockStyleConfig[style].label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </PopoverContent>
        </Popover>
    )
}
