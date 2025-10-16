import { deleteBlock, updateBlock } from "@/lib/db"
import { BlockIdParam, BlockIdParamSchema, UpdateBlockSchema } from "@/types/block"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: BlockIdParam }> }) {
    try {
        const { id } = await params
        const parsedId = BlockIdParamSchema.parse(id)

        const body = await request.json()
        const parsedBody = UpdateBlockSchema.parse(body)

        const updatedBlock = await updateBlock(parsedId, parsedBody)

        if (!updatedBlock) {
            return NextResponse.json({ error: "Block not found" }, { status: 404 })
        }

        return NextResponse.json({ block: updatedBlock })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update block" }, { status: 500 })
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: BlockIdParam }> }) {
    try {
        const { id } = await params
        const parsedId = BlockIdParamSchema.parse(id)

        const isBlockDeleted = await deleteBlock(parsedId)

        if (!isBlockDeleted) {
            return NextResponse.json({ error: "Block not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete block" }, { status: 500 })
    }
}
