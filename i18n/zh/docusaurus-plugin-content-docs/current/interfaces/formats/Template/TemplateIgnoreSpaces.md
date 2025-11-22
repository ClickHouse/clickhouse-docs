---
alias: []
description: 'TemplateIgnoreSpaces 格式文档'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |



## Description {#description}

类似于 [`Template`],但会跳过输入流中分隔符和值之间的空白字符。
但是,如果格式字符串包含空白字符,则这些字符必须在输入流中出现。
还允许指定空占位符(`${}` 或 `${:None}`)将某些分隔符拆分为多个部分,以忽略它们之间的空格。
这些占位符仅用于跳过空白字符。
如果所有行中列值的顺序相同,则可以使用此格式读取 `JSON`。

:::note
此格式仅适用于输入。
:::


## 使用示例 {#example-usage}

以下请求可用于插入格式 [JSON](/interfaces/formats/JSON) 输出示例中的数据:

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
