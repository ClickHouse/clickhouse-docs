| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

以指定的列名将每个值打印在单独的一行上。该格式便于打印单行或少数几行，如果每行包含大量列时尤其方便。
[`NULL`](/sql-reference/syntax.md) 被输出为 `ᴺᵁᴸᴸ`。

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

在垂直格式中，行是不转义的：

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

该格式仅适合输出查询结果，而不适合解析（提取数据以插入表中）。

## 格式设置 {#format-settings}
