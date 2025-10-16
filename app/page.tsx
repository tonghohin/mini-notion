import { BlocksEditor } from "@/components/blocks/blocks-editor"
import { getBlocks } from "@/lib/db"

export default async function Home() {
    const blocks = await getBlocks()

    return (
        <main className="m-auto flex h-dvh max-w-7xl p-4">
            <BlocksEditor initialBlocks={blocks} />
        </main>
    )
}
