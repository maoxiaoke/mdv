# Hello MDX

This is **Markdown**, rendered with **MDX**.

- GFM task list
- [ ] todo
- [x] done

## Links

A normal link: https://example.com

## MDX works too

You can embed JSX.

export function MyBadge({ text }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      background: '#111827',
      color: 'white',
      fontSize: 12
    }}>
      Badge: {text}
    </span>
  )
}

<MyBadge text="works" />
