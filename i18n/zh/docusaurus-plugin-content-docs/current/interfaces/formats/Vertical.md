---
alias: []
description: 'Vertical 格式文档'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: 'Vertical'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 \\{#description\\}

将每个值与其列名一起输出在单独的一行上。如果每行包含大量列，这种格式便于打印单行或少量行的数据。

请注意，[`NULL`](/sql-reference/syntax.md) 会输出为 `ᴺᵁᴸᴸ`，以便更容易区分字符串值 `NULL` 和空值。JSON 列会以美化后的格式输出，并且 `NULL` 会输出为 `null`，因为它是一个有效的 JSON 值，并且与 `"null"` 容易区分。

## 使用示例 \\{#example-usage\\}

示例：

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

在 Vertical 输出格式中，行不会被转义：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

此格式仅适合用于输出查询结果，不适合用于解析（检索要插入到表中的数据）。

## 格式设置 \\{#format-settings\\}
