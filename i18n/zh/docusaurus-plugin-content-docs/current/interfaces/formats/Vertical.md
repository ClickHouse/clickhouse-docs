---
title: 垂直
slug: /interfaces/formats/Vertical
keywords: ['Vertical']
input_format: false
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

以指定的列名打印每个值，每行一个。这种格式方便在每行包含大量列的情况下，仅打印一行或几行数据。
[`NULL`](/sql-reference/syntax.md) 被输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

示例：

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
行 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

在垂直格式中，行不会被转义：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
行 1:
──────
test: string with 'quotes' and      with some special
 characters
```

这种格式仅适用于输出查询结果，但不适用于解析（检索数据以插入表中）。

## 格式设置 {#format-settings}
