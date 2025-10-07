---
'alias': []
'description': 'Vertical 格式的文档'
'input_format': false
'keywords':
- 'Vertical'
'output_format': true
'slug': '/interfaces/formats/Vertical'
'title': 'Vertical'
'doc_type': 'reference'
---

| 输入   | 输出   | 别名   |
|--------|--------|--------|
| ✗     | ✔      |        |

## 描述 {#description}

按指定的列名将每个值打印在单独的行上。此格式适用于仅打印一行或少数几行的情况，尤其是当每行包含大量列时。 [`NULL`](/sql-reference/syntax.md) 被输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

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

在垂直格式中，行不进行转义：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

此格式仅适合输出查询结果，但不适合解析（检索数据以插入到表中）。

## 格式设置 {#format-settings}
