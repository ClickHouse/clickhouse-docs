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

## Description {#description}

`JSON` 格式以 JSON 格式读取和输出数据。

`JSON` 格式返回如下内容：

| Parameter                    | Description                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | 列名和类型。                                                                                                                                                                                                                               |
| `data`                       | 数据表。                                                                                                                                                                                                                                   |
| `rows`                       | 输出的总行数。                                                                                                                                                                                                                             |
| `rows_before_limit_at_least` | 在没有使用 LIMIT 时可能存在的行数的较低估计值。仅在查询包含 LIMIT 时输出。该估计值是基于在到达 LIMIT 变换之前在查询管道中处理的数据块计算得出的，但之后可能会被 LIMIT 变换丢弃。如果数据块在查询管道中甚至没有到达 LIMIT 变换阶段，则不会参与估计。 |
| `statistics`                 | 诸如 `elapsed`、`rows_read`、`bytes_read` 等统计信息。                                                                                                                                                                                     |
| `totals`                     | 总计值（在使用 WITH TOTALS 时）。                                                                                                                                                                                                         |
| `extremes`                   | 极值（当 extremes 被设置为 1 时）。                                                                                                                                                                                                       |

`JSON` 类型与 JavaScript 兼容。为确保这一点，会对某些字符进行额外转义：

- 斜杠 `/` 被转义为 `\/`。
- 会导致部分浏览器出错的替代换行符 `U+2028` 和 `U+2029` 被转义为 `\uXXXX`。
- ASCII 控制字符会被转义：退格、换页、换行、回车和水平制表符分别被替换为 `\b`、`\f`、`\n`、`\r`、`\t`，其余 0x00–0x1F 范围内的字节则使用 `\uXXXX` 序列替换。
- 无效的 UTF-8 序列会被替换为替代字符 `�`，从而保证输出文本仅由有效的 UTF-8 序列组成。

为了与 JavaScript 兼容，Int64 和 UInt64 整数默认会用双引号括起来。  
要去掉引号，可以将配置参数 [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) 设置为 `0`。

ClickHouse 支持 [NULL](/sql-reference/syntax.md)，在 JSON 输出中显示为 `null`。要在输出中启用 `+nan`、`-nan`、`+inf`、`-inf` 值，请将 [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) 设置为 `1`。

## 示例用法

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

对于 JSON 输入格式，如果将设置项 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 设为 `1`，
则会将输入数据中元数据里的类型与表中对应列的类型进行比较。

## 另请参阅 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 格式
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 设置