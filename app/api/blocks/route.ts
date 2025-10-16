import { addBlock, getBlocks } from "@/lib/db"
import { Block, BlocksDataSchema, CreateBlockSchema } from "@/types/block"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        const blocks = await getBlocks()
        const parsedBlocksData = BlocksDataSchema.parse({ blocks })
        return NextResponse.json(parsedBlocksData)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("------ ~ POST ~ body------", body)

        const parsedBody = CreateBlockSchema.parse(body)

        const now = new Date()
        const block: Block = {
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            order: parsedBody.order ?? 0,
            ...(parsedBody.type === "text"
                ? {
                      type: "text",
                      content: parsedBody.content,
                      style: parsedBody.style,
                  }
                : {
                      type: "image",
                      url: parsedBody.url,
                      width: parsedBody.width,
                      height: parsedBody.height,
                  }),
        }

        const createdBlock = await addBlock(block)
        return NextResponse.json({ block: createdBlock }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Failed to create block" }, { status: 500 })
    }
}
