"use client"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageBlock as ImageBlockType } from "@/types/block"
import { CircleAlertIcon, ImageIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { ReactNode, useState } from "react"

export function ImageBlock({ block, onUpdate, onDelete }: { block: ImageBlockType; onUpdate: (id: string, updates: Partial<Pick<ImageBlockType, "url" | "width" | "height">>) => void; onDelete: (blockId: string) => void }) {
    const [isImageError, setIsImageError] = useState(false)

    function handleUrlSubmit(url: string) {
        onUpdate(block.id, { url })
        setIsImageError(false)
    }

    const addImageTrigger = (
        <Item variant="muted" size="sm" className="cursor-pointer">
            <ImageIcon />
            <ItemContent>
                <ItemTitle>Add an image</ItemTitle>
            </ItemContent>
        </Item>
    )

    const replaceImageTrigger = (
        <Button variant="outline" size="sm">
            <ImageIcon />
            Replace the image
        </Button>
    )

    return block.url ? (
        isImageError ? (
            <Empty className="bg-muted">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CircleAlertIcon />
                    </EmptyMedia>
                    <EmptyTitle>Error</EmptyTitle>
                    <EmptyDescription>The image couldn't be loaded.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        <ImageUrlInputPopover trigger={replaceImageTrigger} initialUrl={block.url} onUrlSubmit={handleUrlSubmit} />
                        <Button variant="destructive" size="sm" onClick={() => onDelete(block.id)} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            <Trash2Icon />
                            Delete
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        ) : (
            <div>
                <Image
                    src={block.url}
                    height={block.height}
                    width={block.width}
                    alt="Preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = "none"
                        setIsImageError(true)
                    }}
                />
            </div>
        )
    ) : (
        <ImageUrlInputPopover trigger={addImageTrigger} initialUrl={block.url || ""} onUrlSubmit={(url) => onUpdate(block.id, { url })} />
    )
}

function ImageUrlInputPopover({ trigger, initialUrl, onUrlSubmit }: { trigger: ReactNode; initialUrl: string; onUrlSubmit: (url: string) => void }) {
    const [urlInput, setUrlInput] = useState(initialUrl)
    const [open, setOpen] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onUrlSubmit(urlInput)
        setOpen(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlInput(e.target.value)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="w-96">
                <form onSubmit={handleSubmit} className="grid gap-2">
                    <Label>Image URL</Label>
                    <InputGroup>
                        <InputGroupInput type="url" value={urlInput} onChange={handleChange} placeholder="Paste the image url..." onKeyDown={(e) => e.stopPropagation()} autoFocus onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton type="submit" variant="secondary">
                                {initialUrl ? "Update" : "Add"}
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
            </PopoverContent>
        </Popover>
    )
}
