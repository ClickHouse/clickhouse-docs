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

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## Description {#description}

在单独的行上打印每个值,并显示列名。当每行包含大量列时,此格式便于打印一行或少数几行数据。

注意,[`NULL`](/sql-reference/syntax.md) 输出为 `ᴺᵁᴸᴸ`,以便更容易区分字符串值 `NULL` 和空值。JSON 列将以格式化方式打印,`NULL` 输出为 `null`,因为它是有效的 JSON 值,并且易于与字符串 `"null"` 区分。


## 使用示例 {#example-usage}

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

Vertical 格式中的行不会进行转义：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

此格式仅适用于输出查询结果，不适用于解析（即检索数据并插入表中）。


## 格式设置 {#format-settings}
