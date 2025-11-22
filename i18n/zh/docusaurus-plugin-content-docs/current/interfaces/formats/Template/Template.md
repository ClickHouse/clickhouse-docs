---
alias: []
description: 'Template 格式文档'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
doc_type: 'guide'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

当您需要比其他标准格式提供更多自定义功能时,
`Template` 格式允许用户指定自己的自定义格式字符串(包含值的占位符),
并为数据指定转义规则。

该格式使用以下设置:

| 设置                                                                                                  | 描述                                                                                                                |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`format_template_row`](#format_template_row)                                                            | 指定包含行格式字符串的文件路径。                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 指定包含结果集格式字符串的文件路径                                                      |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 指定行之间的分隔符,该分隔符在除最后一行外的每一行之后打印(或预期)(默认为 `\n`) |
| `format_template_row_format`                                                                             | 以[内联方式](#inline_specification)指定行的格式字符串。                                                     |
| `format_template_resultset_format`                                                                       | 以[内联方式](#inline_specification)指定结果集的格式字符串。                                                   |
| 其他格式的某些设置(例如使用 `JSON` 转义时的 `output_format_json_quote_64bit_integers`) |                                                                                                                            |


## 设置和转义规则 {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

`format_template_row` 设置指定包含行格式字符串的文件路径,其语法如下:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

其中:

| 语法部分  | 描述                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `delimiter_i`   | 值之间的分隔符(`$` 符号可转义为 `$$`)                                                        |
| `column_i`      | 要选择或插入值的列名或索引(如果为空,则跳过该列) |
| `serializeAs_i` | 列值的转义规则                                                                               |

支持以下转义规则:

| 转义规则        | 描述                              |
| -------------------- | ---------------------------------------- |
| `CSV`, `JSON`, `XML` | 与同名格式类似 |
| `Escaped`            | 与 `TSV` 类似                         |
| `Quoted`             | 与 `Values` 类似                      |
| `Raw`                | 不转义,与 `TSVRaw` 类似    |
| `None`               | 无转义规则 - 见下方说明        |

:::note
如果省略转义规则,则使用 `None`。`XML` 仅适用于输出。
:::

下面看一个例子。给定以下格式字符串:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

以下值将被打印(如果使用 `SELECT`)或预期(如果使用 `INPUT`),
分别位于 `Search phrase:`、`, count:`、`, ad price: $` 和 `;` 分隔符之间:

- `s`(使用转义规则 `Quoted`)
- `c`(使用转义规则 `Escaped`)
- `p`(使用转义规则 `JSON`)

例如:

- 如果执行 `INSERT`,下面的行匹配预期模板,将把值 `bathroom interior design`、`2166`、`$3` 读入列 `Search phrase`、`count`、`ad price`。
- 如果执行 `SELECT`,下面的行是输出结果,假设值 `bathroom interior design`、`2166`、`$3` 已存储在表的 `Search phrase`、`count`、`ad price` 列中。

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

`format_template_rows_between_delimiter` 设置指定行之间的分隔符,该分隔符在除最后一行外的每一行之后打印(或预期)(默认为 `\n`)

### format_template_resultset {#format_template_resultset}

`format_template_resultset` 设置指定文件路径,该文件包含结果集的格式字符串。

结果集的格式字符串与行的格式字符串具有相同的语法。
它允许指定前缀、后缀以及打印附加信息的方式,并包含以下占位符来代替列名:

- `data` 是以 `format_template_row` 格式表示的数据行,由 `format_template_rows_between_delimiter` 分隔。此占位符必须是格式字符串中的第一个占位符。
- `totals` 是以 `format_template_row` 格式表示的总计值行(使用 WITH TOTALS 时)。
- `min` 是以 `format_template_row` 格式表示的最小值行(当 extremes 设置为 1 时)。
- `max` 是以 `format_template_row` 格式表示的最大值行(当 extremes 设置为 1 时)。
- `rows` 是输出行的总数。
- `rows_before_limit` 是没有 LIMIT 时本应有的最小行数。仅当查询包含 LIMIT 时才输出。如果查询包含 GROUP BY,则 rows_before_limit_at_least 是没有 LIMIT 时本应有的确切行数。
- `time` 是请求执行时间(以秒为单位)。
- `rows_read` 是已读取的行数。
- `bytes_read` 是已读取的字节数(未压缩)。

占位符 `data`、`totals`、`min` 和 `max` 不得指定转义规则(或必须显式指定 `None`)。其余占位符可以指定任何转义规则。

:::note
如果 `format_template_resultset` 设置为空字符串,则使用 `${data}` 作为默认值。
:::


对于插入查询，如果存在前缀或后缀,该格式允许跳过某些列或字段(参见示例)。

### 内联指定 {#inline_specification}

通常情况下,将模板格式的配置(由 `format_template_row`、`format_template_resultset` 设置)部署到集群中所有节点的目录中具有挑战性或无法实现。
此外,格式可能非常简单,无需放置在文件中。

对于这些情况,可以使用 `format_template_row_format`(对应 `format_template_row`)和 `format_template_resultset_format`(对应 `format_template_resultset`)直接在查询中设置模板字符串,
而不是指定包含模板的文件路径。

:::note
格式字符串和转义序列的规则与以下内容相同:

- 使用 `format_template_row_format` 时的 [`format_template_row`](#format_template_row)。
- 使用 `format_template_resultset_format` 时的 [`format_template_resultset`](#format_template_resultset)。
  :::


## 使用示例 {#example-usage}

让我们看两个使用 `Template` 格式的示例,首先用于查询数据,然后用于插入数据。

### 查询数据 {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>搜索短语</title> </head>
 <body>
  <table border="1"> <caption>搜索短语</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>最大值</caption>
    ${max}
  </table>
  <b>Processed ${rows_read:XML} rows in ${time:XML} sec</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

结果:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>搜索短语</title>
  </head>
  <body>
    <table border="1">
      <caption>搜索短语</caption>
      <tr>
        <th>搜索短语</th>
        <th>计数</th>
      </tr>
      <tr>
        <td></td>
        <td>8267016</td>
      </tr>
      <tr>
        <td>浴室室内设计</td>
        <td>2166</td>
      </tr>
      <tr>
        <td>clickhouse</td>
        <td>1655</td>
      </tr>
      <tr>
        <td>2014年春季时尚</td>
        <td>1549</td>
      </tr>
      <tr>
        <td>自由形式照片</td>
        <td>1480</td>
      </tr>
    </table>
    <table border="1">
      <caption>最大值</caption>
      <tr>
        <td></td>
        <td>8873898</td>
      </tr>
    </table>
    <b>在 0.1569913 秒内处理了 3095973 行</b>
  </body>
</html>
```

### 插入数据 {#inserting-data}

```text
Some header
Page views: 5, User id: 4324182021466249494, Useless field: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Useless field: world, Duration: 185, Sign: 1
Total rows: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Some header\n${data}\nTotal rows: ${:CSV}\n
```

```text title="/some/path/row.format"
Page views: ${PageViews:CSV}, User id: ${UserID:CSV}, Useless field: ${:CSV}, Duration: ${Duration:CSV}, Sign: ${Sign:CSV}
```

占位符中的 `PageViews`、`UserID`、`Duration` 和 `Sign` 是表中的列名。行中 `Useless field` 之后的值以及后缀中 `\nTotal rows:` 之后的值将被忽略。
输入数据中的所有分隔符必须严格等于指定格式字符串中的分隔符。

### 内联规范 {#in-line-specification}

厌倦了手动格式化 Markdown 表格?在本示例中,我们将了解如何使用 `Template` 格式和内联规范设置来完成一个简单的任务 - 从 `system.formats` 表中 `SELECT` 一些 ClickHouse 格式的名称并将它们格式化为 Markdown 表格。使用 `Template` 格式以及 `format_template_row_format` 和 `format_template_resultset_format` 设置可以轻松实现这一点。


在之前的示例中，我们在单独的文件中指定了结果集和行格式字符串，并分别通过 `format_template_resultset` 和 `format_template_row` 设置指定这些文件的路径。这里我们将直接内联编写模板，因为我们的模板非常简单，只包含少量的 `|` 和 `-` 来构造 markdown 表格。我们将使用设置 `format_template_resultset_format` 来指定结果集模板字符串。为了生成表头行，我们在 `${data}` 之前添加了 `|ClickHouse Formats|\n|---|\n`。我们使用设置 `format_template_row_format` 为每一行指定模板字符串 ``|`{0:XML}`|``。`Template` 格式会将按给定格式生成的行插入到占位符 `${data}` 中。在这个示例中我们只有一列，但如果你想添加更多列，可以在行模板字符串中加入 `{1:XML}`、`{2:XML}` 等，并根据需要选择合适的转义规则。在本示例中我们使用了转义规则 `XML`。

```sql title="Query"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT Template
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

看看这个！我们已经省去了手动添加那些 `|` 和 `-` 来生成这个 markdown 表格的麻烦：

```response title="Response"
|ClickHouse 格式|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
