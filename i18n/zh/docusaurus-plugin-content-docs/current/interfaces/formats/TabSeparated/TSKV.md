---
'alias': []
'description': 'TSKV 格式的文档'
'input_format': true
'keywords':
- 'TSKV'
'output_format': true
'slug': '/interfaces/formats/TSKV'
'title': 'TSKV'
---

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

此格式类似于 [`TabSeparated`](./TabSeparated.md) 格式，但以 `name=value` 格式输出值。 
名称的转义方式与 [`TabSeparated`](./TabSeparated.md) 格式相同，`=` 符号也会被转义。

```text
SearchPhrase=   count()=8267016
SearchPhrase=bathroom interior design    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014 spring fashion    count()=1549
SearchPhrase=freeform photos       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=photos of dog breeds    count()=1091
SearchPhrase=curtain designs        count()=1064
SearchPhrase=baku       count()=1000
```


```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
当存在大量小列时，这种格式的效果不佳，通常没有理由使用它。 
然而，就效率而言，它并不比 [`JSONEachRow`](../JSON/JSONEachRow.md) 格式差。
:::

在解析时，支持不同列的值以任何顺序出现。 
可以省略某些值，因为它们被视为等同于其默认值。
在这种情况下，零和空行用作默认值。 
未在表中指定的复杂值不支持作为默认值。

解析允许添加一个额外的字段 `tskv`，不带等号或值。此字段会被忽略。

在导入时，如果设置了 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，将跳过未知名称的列。

[NULL](/sql-reference/syntax.md) 被格式化为 `\N`。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
