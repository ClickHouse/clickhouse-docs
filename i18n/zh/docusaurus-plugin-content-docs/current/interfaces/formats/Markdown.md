---
title: 'Markdown'
slug: '/interfaces/formats/Markdown'
keywords: ['Markdown']
---

## 描述 {#description}

您可以使用 [Markdown](https://en.wikipedia.org/wiki/Markdown) 格式导出结果，以生成可以粘贴到您的 `.md` 文件中的输出：

markdown 表将自动生成，并可在支持 markdown 的平台上使用，例如 Github。此格式仅用于输出。

## 示例用法 {#example-usage}

```sql
SELECT
    number,
    number * 2
FROM numbers(5)
FORMAT Markdown
```
```results
| number | multiply(number, 2) |
|-:|-:|
| 0 | 0 |
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 4 | 8 |
```

## 格式设置 {#format-settings}
