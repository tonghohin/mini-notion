"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ReactNode } from "react"

interface DraggableItemProps {
    id: string
    children: ReactNode
}

export function DraggableItem({ id, children }: DraggableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const transformStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 0,
    }

    return (
        <div ref={setNodeRef} className="flex-1" style={transformStyle} {...attributes} {...listeners}>
            {children}
        </div>
    )
}
