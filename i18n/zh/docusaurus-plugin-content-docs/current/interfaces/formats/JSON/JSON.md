---
title: 'JSON'
slug: /interfaces/formats/JSON
keywords: ['JSON']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|------|------|-------|
| ✔    | ✔    |       |

## 描述 {#description}

`JSON` 格式以 JSON 格式读取和输出数据。

`JSON` 格式返回以下内容：

| 参数                         | 描述                                                                                                                                                                                                 |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | 列名和类型。                                                                                                                                                                                         |
| `data`                       | 数据表。                                                                                                                                                                                             |
| `rows`                       | 输出行的总数。                                                                                                                                                                                       |
| `rows_before_limit_at_least` | 如果没有 LIMIT，至少会有的行数。当查询包含 LIMIT 时输出。 如果查询包含 `GROUP BY`，则 `rows_before_limit_at_least` 是没有 `LIMIT` 时的确切行数。                                                  |
| `statistics`                 | 统计信息，例如 `elapsed`、`rows_read`、`bytes_read`。                                                                                                                                            |
| `totals`                     | 总值（使用 WITH TOTALS 时）。                                                                                                                                                                       |
| `extremes`                   | 极端值（当 extremes 设置为 1 时）。                                                                                                                                                                  |

`JSON` 类型与 JavaScript 兼容。为了确保这一点，某些字符被额外转义：
- 斜杠 `/` 被转义为 `\/`
- 换行符 `U+2028` 和 `U+2029`（会中断某些浏览器）被转义为 `\uXXXX`。 
- ASCII 控制字符被转义：退格、换页、换行、回车和水平制表符被替换为 `\b`、`\f`、`\n`、`\r`、`\t`，以及 00-1F 范围内的剩余字节使用 `\uXXXX` 序列进行转义。
- 无效的 UTF-8 序列被更改为替代字符 �，因此输出文本将由有效的 UTF-8 序列组成。

为了与 JavaScript 兼容，Int64 和 UInt64 整数默认用双引号括起来。
要去掉引号，可以将配置参数 [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) 设置为 `0`。

ClickHouse 支持 [NULL](/sql-reference/syntax.md)，在 JSON 输出中显示为 `null`。要在输出中启用 `+nan`、`-nan`、`+inf`、`-inf` 值，请将 [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) 设置为 `1`。

## 示例用法 {#example-usage}

示例：

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

```json
{
        "meta":
        [
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

        "data":
        [
                {
                        "num": 42,
                        "str": "hello",
                        "arr": [0,1]
                },
                {
                        "num": 43,
                        "str": "hello",
                        "arr": [0,1,2]
                },
                {
                        "num": 44,
                        "str": "hello",
                        "arr": [0,1,2,3]
                }
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001137687,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## 格式设置 {#format-settings}

对于 JSON 输入格式，如果设置 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 为 `1`，则输入数据中的元数据类型将与表中相应列的类型进行比较。

## 另请参阅 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 格式
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 设置
