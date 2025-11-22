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

| 输入 | 输出 | 别名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |



## 描述 {#description}

在 TabSeparated 格式中,数据按行写入。每行包含由制表符分隔的值。每个值后面跟一个制表符,但行中的最后一个值例外,其后跟一个换行符。所有位置都严格使用 Unix 换行符。最后一行末尾也必须包含换行符。值以文本格式写入,不使用引号包围,特殊字符会进行转义。

此格式也可以使用名称 `TSV`。

`TabSeparated` 格式便于使用自定义程序和脚本处理数据。它是 HTTP 接口和命令行客户端批处理模式中的默认格式。此格式还允许在不同的数据库管理系统之间传输数据。例如,您可以从 MySQL 获取转储文件并上传到 ClickHouse,反之亦然。

`TabSeparated` 格式支持输出总计值(使用 WITH TOTALS 时)和极值(当 'extremes' 设置为 1 时)。在这些情况下,总计值和极值会在主数据之后输出。主结果、总计值和极值之间通过空行相互分隔。示例:

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

整数以十进制形式写入。数字开头可以包含额外的"+"字符(解析时忽略,格式化时不记录)。非负数不能包含负号。读取时,允许将空字符串解析为零,或者(对于有符号类型)将仅包含负号的字符串解析为零。不符合相应数据类型的数字可能会被解析为不同的数字,且不会产生错误消息。

浮点数以十进制形式写入。使用点号作为小数分隔符。支持指数表示法,以及 'inf'、'+inf'、'-inf' 和 'nan'。浮点数可以以小数点开始或结束。
格式化过程中,浮点数可能会损失精度。
解析过程中,不严格要求读取最接近的机器可表示数字。

日期以 YYYY-MM-DD 格式写入并以相同格式解析,但可以使用任何字符作为分隔符。
带时间的日期以 `YYYY-MM-DD hh:mm:ss` 格式写入并以相同格式解析,但可以使用任何字符作为分隔符。
这些操作都在客户端或服务器启动时的系统时区中进行(取决于由哪一方格式化数据)。对于带时间的日期,不指定夏令时。因此,如果转储包含夏令时期间的时间,转储将无法明确匹配数据,解析时会选择两个时间中的一个。
读取操作期间,不正确的日期和带时间的日期可以通过自然溢出解析或解析为空日期和时间,且不会产生错误消息。

作为例外,如果恰好由 10 个十进制数字组成,也支持以 Unix 时间戳格式解析带时间的日期。结果不依赖于时区。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串输出时会对特殊字符进行反斜杠转义。输出使用以下转义序列:`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析还支持序列 `\a`、`\v` 和 `\xHH`(十六进制转义序列)以及任何 `\c` 序列,其中 `c` 是任意字符(这些序列会被转换为 `c`)。因此,读取数据时支持将换行符写为 `\n` 或 `\`,或作为换行符本身的格式。例如,字符串 `Hello world` 在单词之间使用换行符而不是空格,可以用以下任何变体解析:

```text
Hello\nworld

Hello\
world
```

支持第二种变体是因为 MySQL 在写入制表符分隔的转储时使用它。

在 TabSeparated 格式中传递数据时需要转义的最小字符集:制表符、换行符(LF)和反斜杠。

只有一小部分符号会被转义。您很容易遇到终端在输出时会显示错误的字符串值。

数组以方括号中逗号分隔的值列表形式写入。数组中的数字项按正常方式格式化。`Date` 和 `DateTime` 类型用单引号括起来。字符串用单引号括起来,并使用与上述相同的转义规则。

[NULL](/sql-reference/syntax.md) 根据设置 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 进行格式化(默认值为 `\N`)。

在输入数据中,ENUM 值可以表示为名称或 ID。首先,我们尝试将输入值与 ENUM 名称匹配。如果失败且输入值是数字,我们尝试将此数字与 ENUM ID 匹配。
如果输入数据仅包含 ENUM ID,建议启用设置 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 以优化 ENUM 解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的每个元素都表示为数组。

例如:

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


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

使用以下名为 `football.tsv` 的 tsv 文件:

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

插入数据:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### 读取数据 {#reading-data}

使用 `TabSeparated` 格式读取数据:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

输出将以制表符分隔格式显示:

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

| 设置                                                                                                                                                  | 说明                                                                                                                                                                                                                            | 默认值 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 格式中 NULL 的自定义表示形式。                                                                                                                                                                                              | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式,还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将 TSV 格式中插入的枚举值视为枚举索引。                                                                                                                                                                                             | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些调整和启发式方法来推断 TSV 格式的架构。如果禁用,所有字段将被推断为 String 类型。                                                                                                                                                                                                     | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为 true,TSV 输出格式的行尾将使用 `\r\n` 而不是 `\n`。                                                                                                                                                    | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为 true,TSV 输入格式的行尾将使用 `\r\n` 而不是 `\n`。                                                                                                                                                     | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头指定数量的行。                                                                                                                                                                                               | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测 TSV 格式中包含名称和类型的标题行。                                                                                                                                                                                        | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的空行。                                                                                                                                                                                          | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许 TSV 格式中的列数可变,忽略多余的列并对缺失的列使用默认值。                                                                                                                                                                                                        | `false` |
