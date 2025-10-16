# Mini Notion Clone

A lightweight Notion-style page editor built with **Next.js**.  
This project implements the **core requirements** of the Full Stack Engineer Assessment — allowing users to create, edit, reorder, and persist text and image blocks using a simple JSON file as storage.

## Features

### Core Requirements

- **Load and render blocks**  
  Renders both text and image blocks in a vertical stack.

- **Add new blocks**
    - Text blocks: editable content with styles (`H1`, `H2`, `H3`, `Paragraph`)
    - Image blocks: editable source URL, width, and height

- **Edit existing blocks**  
  Users can update text content, style, or image properties at any time.

- **Persistence with JSON storage**  
  All blocks are saved to a local JSON file, ensuring changes remain after page reloads.

## Built with

- Next.js
- shadcn/ui
- dnd kit
- react-resizable
