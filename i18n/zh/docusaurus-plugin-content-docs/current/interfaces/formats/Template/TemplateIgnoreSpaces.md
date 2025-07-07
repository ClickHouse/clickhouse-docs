---
'alias': []
'description': 'TemplateIgnoreSpaces 格式的文档'
'input_format': true
'keywords':
- 'TemplateIgnoreSpaces'
'output_format': false
'slug': '/interfaces/formats/TemplateIgnoreSpaces'
'title': 'TemplateIgnoreSpaces'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

类似于 [`Template`]，但跳过输入流中分隔符和数值之间的空白字符。 
但是，如果格式字符串包含空白字符，这些字符将在输入流中被期望出现。 
还允许指定空占位符 (`${}` 或 `${:None}`) 将某些分隔符拆分为单独的部分以忽略它们之间的空格。 
这些占位符仅用于跳过空白字符。
如果所有行中的列值顺序相同，可以使用此格式读取 `JSON`。

:::note
此格式仅适用于输入。
:::

## 示例用法 {#example-usage}

以下请求可用于从格式 [JSON](/interfaces/formats/JSON) 的输出示例中插入数据：

```sql
INSERT INTO table_name 
SETTINGS
    format_template_resultset = '/some/path/resultset.format',
    format_template_row = '/some/path/row.format',
    format_template_rows_between_delimiter = ','
FORMAT TemplateIgnoreSpaces
```

```text title="/some/path/resultset.format"
{${}"meta"${}:${:JSON},${}"data"${}:${}[${data}]${},${}"totals"${}:${:JSON},${}"extremes"${}:${:JSON},${}"rows"${}:${:JSON},${}"rows_before_limit_at_least"${}:${:JSON}${}}
```

```text title="/some/path/row.format"
{${}"SearchPhrase"${}:${}${phrase:JSON}${},${}"c"${}:${}${cnt:JSON}${}}
```

## 格式设置 {#format-settings}
