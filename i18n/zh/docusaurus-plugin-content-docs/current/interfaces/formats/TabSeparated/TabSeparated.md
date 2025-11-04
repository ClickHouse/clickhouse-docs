---
'alias':
- 'TSV'
'description': 'TSV 格式的文档'
'input_format': true
'keywords':
- 'TabSeparated'
- 'TSV'
'output_format': true
'slug': '/interfaces/formats/TabSeparated'
'title': 'TabSeparated'
'doc_type': 'reference'
---

| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 描述 {#description}

在制表符分隔格式中，数据按行写入。每一行包含用制表符分隔的值。除了行中的最后一个值后面有换行符外，每个值后面都跟着一个制表符。假定在所有地方严格使用 Unix 换行符。最后一行也必须在末尾含有换行符。值以文本格式写入，不带引号，特殊字符被转义。

这种格式也称为 `TSV`。

`TabSeparated` 格式方便使用自定义程序和脚本处理数据。它在 HTTP 接口和命令行客户端的批处理模式中默认使用。此格式还允许在不同的 DBMS 之间传输数据。例如，你可以从 MySQL 获取转储并上传到 ClickHouse，反之亦然。

`TabSeparated` 格式支持输出总值（使用 WITH TOTALS 时）和极值（当 'extremes' 设置为 1 时）。在这些情况下，总值和极值在主数据之后输出。主结果、总值和极值之间用空行分隔。示例：

```sql
SELECT EventDate, count() AS c FROM test.hits GROUP BY EventDate WITH TOTALS ORDER BY EventDate FORMAT TabSeparated

2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

## 数据格式化 {#tabseparated-data-formatting}

整数以十进制形式写入。数字可以在前面包含一个额外的 "+" 符号（在解析时被忽略，格式化时不记录）。非负数字不能包含负号。在读取时，允许将空字符串解析为零，或（对于有符号类型）将仅由负号组成的字符串解析为零。不适合相应数据类型的数字可能会被解析为不同的数字，而没有错误信息。

浮点数以十进制形式写入。小数点用作小数分隔符。支持指数条目，以及 'inf'、'+inf'、'-inf' 和 'nan'。浮点数的条目可以以小数点开头或结尾。格式化时，浮点数可能会失去精度。在解析时，不严格要求读取最接近的机器可表示数字。

日期以 YYYY-MM-DD 格式写入，并以相同格式解析，但分隔符可以是任意字符。带时间的日期以 `YYYY-MM-DD hh:mm:ss` 格式写入，并以相同格式解析，但分隔符可以是任意字符。这一切都发生在客户端或服务器启动时的系统时区（取决于哪个格式化数据）。对于带时间的日期，不指定夏令时。因此，如果转储包含夏令时的时间，转储并不明确匹配数据，解析将选择两者中的一个时间。在读取操作期间，不正确的日期和带时间的日期可以被自然溢出或作为空日期和时间解析，而没有错误信息。

作为例外，如果 Unix 时间戳格式正好由 10 个十进制数字组成，则也支持解析带时间的日期。结果不依赖于时区。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串以反斜杠转义的特殊字符输出。用于输出的转义序列如下：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析也支持序列 `\a`、`\v` 和 `\xHH`（十六进制转义序列）以及任何 `\c` 序列，其中 `c` 是任意字符（这些序列会转换为 `c`）。因此，读取数据支持格式，其中换行符可以写作 `\n` 或 `\`，也可以写作换行符。例如，字符串 `Hello world` 在单词之间有换行符而不是空格，可以在以下任一变体中解析：

```text
Hello\nworld

Hello\
world
```

第二个变体被支持，因为 MySQL 在写入制表符分隔转储时使用了它。

在以 TabSeparated 格式传递数据时，你需要转义的最小字符集：制表符、换行符 (LF) 和反斜杠。

只有一小部分符号被转义。你可能会轻易陷入终端在输出时破坏字符串值的情况。

数组作为用逗号分隔的值的列表以方括号写入。数组中的数字项目按正常格式化。`Date` 和 `DateTime` 类型以单引号写入。字符串以单引号写入，遵循以上相同的转义规则。

[NULL](/sql-reference/syntax.md) 根据设置 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 格式化（默认值为 `\N`）。

在输入数据中，ENUM 值可以表示为名称或 id。首先，我们尝试将输入值与 ENUM 名称匹配。如果失败且输入值是数字，我们将尝试将该数字与 ENUM id 匹配。如果输入数据仅包含 ENUM ids，建议启用设置 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 以优化 ENUM 解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的每个元素表示为一个数组。

例如：

```sql
CREATE TABLE nestedt
(
    `id` UInt8,
    `aux` Nested(
        a UInt8,
        b String
    )
)
ENGINE = TinyLog
```
```sql
INSERT INTO nestedt VALUES ( 1, [1], ['a'])
```
```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用以下名为 `football.tsv` 的 tsv 文件：

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### 读取数据 {#reading-data}

使用 `TabSeparated` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

输出将是制表符分隔格式：

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## 格式设置 {#format-settings}

| 设置                                                                                                                                                          | 描述                                                                                                                                                                                                                                    | 默认  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 格式中的自定义 NULL 表示。                                                                                                                                                                                                      | `\N`  |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式，必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 在 TSV 格式中将插入的枚举值视为枚举索引。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些技巧和启发式来推断 TSV 格式中的模式。如果禁用，所有字段将被推断为字符串。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为 true，则 TSV 输出格式中的行末将是 `\r\n` 而不是 `\n`。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为 true，则 TSV 输入格式中的行末将是 `\r\n` 而不是 `\n`。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头指定数量的行。                                                                                                                                                                                       | `0`   |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测 TSV 格式中的带名称和类型的头部。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的尾随空行。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许 TSV 格式中的可变列数，忽略多余的列，并在缺失的列上使用默认值。                                                                                                                                | `false` |
