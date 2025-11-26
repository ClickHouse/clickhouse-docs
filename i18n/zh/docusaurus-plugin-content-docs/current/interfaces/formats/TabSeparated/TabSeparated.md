---
alias: ['TSV']
description: 'TSV 格式文档'
input_format: true
keywords: ['TabSeparated', 'TSV']
output_format: true
slug: /interfaces/formats/TabSeparated
title: 'TabSeparated'
doc_type: 'reference'
---

| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |



## 描述

在 TabSeparated 格式中，数据按行写入。每一行包含由制表符分隔的值。每个值后面都跟着一个制表符，除了该行的最后一个值，它后面跟的是换行符。在所有场景下都假定使用 Unix 风格换行符。最后一行的末尾也必须包含一个换行符。各个值以文本格式写入，不带引号，且特殊字符会被转义。

这种格式也称为 `TSV`。

`TabSeparated` 格式适合通过自定义程序和脚本处理数据。它在 HTTP 接口以及命令行客户端的批处理模式中是默认使用的格式。此格式也便于在不同数据库管理系统（DBMS）之间传输数据。例如，你可以从 MySQL 获取转储并上传到 ClickHouse，反之亦然。

`TabSeparated` 格式支持输出汇总值（使用 WITH TOTALS 时）和极值（当将 `'extremes'` 设置为 1 时）。在这些情况下，汇总值和极值会输出在主数据之后。主结果集、汇总值和极值之间通过一个空行分隔。示例：

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


## 数据格式化

整数以十进制形式书写。数字开头可以包含额外的“+”字符（解析时会被忽略，格式化输出时也不会被输出）。非负数不能包含负号。在读取时，允许将空字符串解析为零，或者（对于有符号类型）将仅包含一个减号的字符串解析为零。超出对应数据类型范围的数字可能会被解析为其他数值，而不会产生错误信息。

浮点数以十进制形式书写，小数点使用点号作为分隔符。支持指数表示，以及 `inf`、`+inf`、`-inf` 和 `nan`。浮点数的表示形式可以以小数点开头或结尾。
在格式化过程中，浮点数可能会丢失精度。
在解析过程中，不严格要求读取为最接近的机器可表示数值。

日期以 `YYYY-MM-DD` 格式书写，并以同一格式解析，但分隔符可以是任意字符。
带时间的日期以 `YYYY-MM-DD hh:mm:ss` 格式书写，并以同一格式解析，但分隔符可以是任意字符。
上述操作均在客户端或服务端启动时所使用的系统时区中进行（取决于哪一方在进行数据格式化）。对于带时间的日期，不指定夏令时。因此，如果转储中包含处于夏令时段的时间，则该转储与数据并非一一对应，解析时会在两个时间中选择其一。
在读取操作中，不正确的日期和带时间的日期可以按自然溢出的方式解析，或者解析为空日期和时间，而不会产生错误信息。

作为例外，如果带时间的日期以 Unix 时间戳格式表示，并且恰好由 10 位十进制数字组成，也支持这种解析方式。解析结果与时区无关。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串输出时会对特殊字符进行反斜杠转义。输出时使用以下转义序列：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析时还支持序列 `\a`、`\v` 和 `\xHH`（十六进制转义序列），以及任意 `\c` 序列，其中 `c` 为任意字符（这些序列会被转换为 `c`）。因此，读取数据时支持多种格式，其中换行符可以写作 `\n`、写作反斜杠加换行，或直接写为换行符。例如，字符串 `Hello world` 如果在单词之间使用换行符而不是空格，则可以用以下任意变体进行解析：

```text
你好\n世界

你好\
世界
```

之所以支持第二种变体，是因为 MySQL 在写入制表符分隔的转储文件时会使用它。

在以 TabSeparated 格式传递数据时，必须转义的最小字符集为：制表符、换行符（LF）和反斜杠。

只有一小部分字符会被转义。你很容易遇到在终端输出时显示会被破坏的字符串值。

数组以方括号包裹的逗号分隔值列表的形式写出。数组中的数值元素按常规方式格式化。`Date` 和 `DateTime` 类型用单引号包裹。字符串也用单引号包裹，并使用与上文相同的转义规则。

[NULL](/sql-reference/syntax.md) 的格式取决于设置 [format&#95;tsv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)（默认值为 `\N`）。

在输入数据中，ENUM 值可以用名称或 id 表示。我们会首先尝试将输入值与 ENUM 名称匹配。如果失败且输入值是数字，则尝试将该数字与 ENUM id 匹配。
如果输入数据只包含 ENUM id，建议启用设置 [input&#95;format&#95;tsv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 以优化 ENUM 解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的每个元素都表示为一个数组。

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


## 使用示例

### 插入数据

使用以下名为 `football.tsv` 的 TSV 文件：

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

### 读取数据

以 `TabSeparated` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

输出将为制表符分隔的格式：

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

| Setting                                                                                                                                                          | Description                                                                                                                                                                                                                                    | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | 自定义 TSV 格式中 NULL 的表示形式。                                                                                                                                                                                                          | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式，还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将 TSV 格式中插入的枚举值按枚举索引处理。                                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用若干调整和启发式规则来推断 TSV 格式中的 schema。若禁用，所有字段都将被推断为 String。                                                                                                                                                    | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 若设置为 true，TSV 输出格式中的行尾将使用 `\r\n` 而不是 `\n`。                                                                                                                                                                                | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 若设置为 true，TSV 输入格式中的行尾将使用 `\r\n` 而不是 `\n`。                                                                                                                                                                                | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头指定数量的行。                                                                                                                                                                                                                     | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 在 TSV 格式中自动检测包含名称和类型的表头行。                                                                                                                                                                                                 | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的空行。                                                                                                                                                                                                                           | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许 TSV 格式中列数可变，忽略多余列，并对缺失列使用默认值。                                                                                                                                                                                   | `false` |
