---
alias: []
description: 'JSON 格式文档'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

`JSON` 格式用于以 JSON 格式读取和输出数据。

`JSON` 格式返回以下内容:

| 参数                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta`                       | 列名和类型。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `data`                       | 数据表。                                                                                                                                                                                                                                                                                                                                                                                                        |
| `rows`                       | 输出行的总数。                                                                                                                                                                                                                                                                                                                                                                                                  |
| `rows_before_limit_at_least` | 在没有 LIMIT 的情况下可能存在的行数的下限估计值。仅当查询包含 LIMIT 时才输出。此估计值根据查询管道中 limit 转换之前处理的数据块计算得出,但这些数据块随后可能被 limit 转换丢弃。如果数据块在查询管道中甚至未到达 limit 转换,则不参与估计。                                                                                                                                                                          |
| `statistics`                 | 统计信息,例如 `elapsed`、`rows_read`、`bytes_read`。                                                                                                                                                                                                                                                                                                                                                           |
| `totals`                     | 总计值(使用 WITH TOTALS 时)。                                                                                                                                                                                                                                                                                                                                                                                  |
| `extremes`                   | 极值(当 extremes 设置为 1 时)。                                                                                                                                                                                                                                                                                                                                                                                |

`JSON` 类型与 JavaScript 兼容。为确保兼容性,某些字符会进行额外的转义:

- 斜杠 `/` 被转义为 `\/`
- 替代换行符 `U+2028` 和 `U+2029`(会导致某些浏览器出现问题)被转义为 `\uXXXX`。
- ASCII 控制字符被转义:退格、换页、换行、回车和水平制表符分别替换为 `\b`、`\f`、`\n`、`\r`、`\t`,以及 00-1F 范围内的其余字节使用 `\uXXXX` 序列。
- 无效的 UTF-8 序列被更改为替换字符 �,因此输出文本将由有效的 UTF-8 序列组成。

为了与 JavaScript 兼容,Int64 和 UInt64 整数默认用双引号括起来。
要移除引号,可以将配置参数 [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) 设置为 `0`。

ClickHouse 支持 [NULL](/sql-reference/syntax.md),在 JSON 输出中显示为 `null`。要在输出中启用 `+nan`、`-nan`、`+inf`、`-inf` 值,请将 [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) 设置为 `1`。


## 使用示例 {#example-usage}

示例：

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

```json
{
  "meta": [
    {
      "name": "num",
      "type": "Int32"
    },
    {
      "name": "str",
      "type": "String"
    },
    {
      "name": "arr",
      "type": "Array(UInt8)"
    }
  ],

  "data": [
    {
      "num": 42,
      "str": "hello",
      "arr": [0, 1]
    },
    {
      "num": 43,
      "str": "hello",
      "arr": [0, 1, 2]
    },
    {
      "num": 44,
      "str": "hello",
      "arr": [0, 1, 2, 3]
    }
  ],

  "rows": 3,

  "rows_before_limit_at_least": 3,

  "statistics": {
    "elapsed": 0.001137687,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```


## 格式设置 {#format-settings}

对于 JSON 输入格式,如果将设置 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 设为 `1`,
则会将输入数据元数据中的类型与表中相应列的类型进行比较。


## 另请参阅 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 格式
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 设置
