---
title: Sample Document
date: 2024-04-19T10:00:00
---

# JustRead.me Sample Document

This is a sample markdown file to test the JustRead.me application.

## Features

- **Easy to Use**: Simply drop your markdown files
- **Clean Rendering**: Beautiful markdown rendering
- **Shareable**: Get a unique URL for each document

## Code Example

```typescript
// Sample TypeScript code
interface Document {
  title: string;
  content: string;
  slug: string;
}

const createDocument = (content: string): Document => {
  return {
    title: "New Document",
    content,
    slug: generateSlug()
  };
};
```

## Lists

1. First item
2. Second item
3. Third item

## Formatting

*Italic text* and **bold text** are supported.

> Blockquotes are also supported for important notes.

## Links

[Visit JustRead.me](https://justread.me)

## Tables

| Feature | Description |
|---------|-------------|
| Markdown | Full markdown support |
| Sharing | Easy URL sharing |
| Simple | No account needed |

## Images

*Note: Images are not supported in the MVP*

## Math

Inline math: $E = mc^2$

Block math:
$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$ 