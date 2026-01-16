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

## 描述 \\{#description\\}

与 [`Template`] 类似，但会跳过输入流中分隔符与值之间的空白字符。  
但是，如果格式字符串本身包含空白字符，则会在输入流中严格匹配这些空白字符。  
还允许指定空占位符（`${}` 或 `${:None}`），用于将某个分隔符拆分为多个部分，从而忽略这些部分之间的空格。  
这些占位符仅用于跳过空白字符。  
如果所有行中列值的顺序相同，则可以使用此格式读取 `JSON`。

:::note
此格式仅支持输入。
:::

## 示例用法 \\{#example-usage\\}

以下请求可用于根据其 [JSON](/interfaces/formats/JSON) 格式的输出示例插入数据：

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

## 格式设置 \\{#format-settings\\}