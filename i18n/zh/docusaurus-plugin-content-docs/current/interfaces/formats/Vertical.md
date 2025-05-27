---
'alias': []
'description': 'Vertical 格式的文档'
'input_format': false
'keywords':
- 'Vertical'
'output_format': true
'slug': '/interfaces/formats/Vertical'
'title': 'Vertical'
---

| 输入  | 输出  | 别名  |
|-------|-------|-------|
| ✗     | ✔     |       |

## 描述 {#description}

在指定的列名下，将每个值打印在单独的一行。这种格式适用于只打印一行或少数几行，尤其当每行包含大量列时。
[`NULL`](/sql-reference/syntax.md) 的输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

示例:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

在垂直格式中行不会被转义：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

这种格式仅适合输出查询结果，不适合解析（获取数据以插入表中）。

## 格式设置 {#format-settings}
