import { Block, BlockIdParam, BlockSchema, BlocksDataSchema } from "@/types/block"
import fs from "fs/promises"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "blocks.json")

async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE)
    } catch {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
        await fs.writeFile(DATA_FILE, JSON.stringify({ blocks: [] }, null, 2))
    }
}

export async function getBlocks() {
    await ensureDataFile()
    const file = await fs.readFile(DATA_FILE, "utf-8")
    const data = JSON.parse(file)
    const parsedData = BlocksDataSchema.parse(data)
    return parsedData.blocks.sort((a, b) => a.order - b.order)
}

export async function saveBlocks(blocks: Block[]) {
    await ensureDataFile()
    const data = { blocks }
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function addBlock(block: Block) {
    const blocks = await getBlocks()
    await saveBlocks([...blocks, block])
    return block
}

export async function updateBlock(id: BlockIdParam, updates: Partial<Block>) {
    const blocks = await getBlocks()
    const index = blocks.findIndex((block) => block.id === id)

    if (index === -1) return null

    const existingBlock = blocks[index]
    const updatedBlock = BlockSchema.parse({
        ...existingBlock,
        ...updates,
        id: existingBlock.id,
        createdAt: existingBlock.createdAt,
        updatedAt: new Date(),
    })

    let updatedBlocks = [...blocks.slice(0, index), updatedBlock, ...blocks.slice(index + 1)]

    if ("order" in updates && updates.order !== undefined) {
        updatedBlocks = updatedBlocks.sort((a, b) => a.order - b.order)
    }

    await saveBlocks(updatedBlocks)
    return updatedBlock
}

export async function deleteBlock(id: BlockIdParam) {
    const blocks = await getBlocks()
    const filteredBlocks = blocks.filter((block) => block.id !== id)

    if (filteredBlocks.length === blocks.length) return false

    await saveBlocks(filteredBlocks)
    return true
}

export async function reorderBlocks(orderedIds: BlockIdParam[]) {
    const blocks = await getBlocks()

    const reorderedBlocks = orderedIds.map((id, index) => {
        const block = blocks.find((block) => block.id === id)
        if (!block) throw new Error(`Block ${id} not found`)
        return { ...block, order: index }
    })

    await saveBlocks(reorderedBlocks)
    return reorderedBlocks
}
