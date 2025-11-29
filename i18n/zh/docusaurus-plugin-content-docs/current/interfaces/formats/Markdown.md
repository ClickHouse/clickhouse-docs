---
alias: ['MD']
description: 'Markdown 格式文档的说明'
keywords: ['Markdown']
slug: /interfaces/formats/Markdown
title: 'Markdown'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      | `MD`  |



## 描述 {#description}

你可以使用 [Markdown](https://en.wikipedia.org/wiki/Markdown) 格式导出结果，生成可以直接粘贴到 `.md` 文件中的输出：

Markdown 表格会自动生成，并且可以在支持 Markdown 的平台（例如 GitHub）上使用。此格式仅用于输出。



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