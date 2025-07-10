# ClickHouse Docs Known Issues and Edge Cases

This document serves as a reference for known issues or "gotchas" that can be run into during development.

### VerticalStepper Heading Spacing Edge Case

In ClickHouse docs, when using the `<VerticalStepper>` component, there is a rendering quirk related to headings that immediately follow list items.

Problem
Headings inside a `<VerticalStepper>` that come directly after a list item without any intermediate lines or elements can cause layout or rendering issues in the documentation UI.

Required Fix
To avoid this, always insert a `<br/>` line between a list item and the following heading inside a `<VerticalStepper>`.

For example, this needs fixing:

```
- Item one
- Item two
### Heading
```
Should be changed to:

```
- Item one
- Item two
<br/>
### Heading
```
Why?
The `<br/>` forces a line break, preventing rendering glitches caused by immediately adjacent list items and headers within the stepper. A blank line between the list item and heading is not sufficient and will still cause warnings/errors.