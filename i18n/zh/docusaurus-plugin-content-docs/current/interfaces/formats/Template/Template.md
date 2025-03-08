---
title: 模板
slug: /interfaces/formats/Template
keywords: ['Template']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

对于需要比其他标准格式提供更多自定义的情况， `Template` 格式允许用户指定自己的自定义格式字符串，其中包含值的占位符，并指定数据的转义规则。

它使用以下设置：

| 设置                                                                                                    | 描述                                                                                                                        |
|--------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                        | 指定包含行格式字符串的文件路径。                                                                                         |
| [`format_template_resultset`](#format_template_resultset)                                            | 指定包含行格式字符串的文件路径。                                                                                         |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                    | 指定行之间的分隔符，该分隔符在每行结束后打印（或期望）除了最后一行以外的每一行（默认是 `\n`）                                        |
| `format_template_row_format`                                                                           | 指定行的格式字符串 [内联](#inline_specification)。                                                                          |                                                                           
| `format_template_resultset_format`                                                                     | 指定结果集格式字符串 [内联](#inline_specification)。                                                                      |
| 一些其他格式的设置（例如在使用 `JSON` 转义时的 `output_format_json_quote_64bit_integers` 处理） |                                                                                                                            |

## 设置和转义规则 {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

设置 `format_template_row` 指定包含行格式字符串的文件路径，其语法如下：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

其中：

| 语法部分       | 描述                                                                                                            |
|----------------|----------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 值之间的分隔符（`$` 符号可以转义为 `$$`）                                                                     |
| `column_i`     | 要选择或插入的列的名称或索引（如果为空，则跳过该列）                                                           |
|`serializeAs_i` | 列值的转义规则。                                                                                            |

支持以下转义规则：

| 转义规则        | 描述                                        |
|------------------|---------------------------------------------|
| `CSV`, `JSON`, `XML` | 与同名格式相似                             |
| `Escaped`        | 类似于 `TSV`                                |
| `Quoted`         | 类似于 `Values`                             |
| `Raw`            | 无转义，类似于 `TSVRaw`                      |   
| `None`           | 无转义规则 - 见下文说明                     |

:::note
如果省略转义规则，则使用 `None`。 `XML` 仅适用于输出。
:::

让我们看一个例子。给定以下格式字符串：

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

以下值将被打印（如果使用 `SELECT`），或期望（如果使用 `INPUT`），位于列 `Search phrase:`、`, count:`、`, ad price: $` 和 `;` 分隔符之间：

- `s`（使用转义规则 `Quoted`）
- `c`（使用转义规则 `Escaped`）
- `p`（使用转义规则 `JSON`）

例如：

- 如果 `INSERT`，以下行符合预期模板，并将值 `bathroom interior design`、`2166`、`$3` 读取到列 `Search phrase`、`count`、`ad price` 中。
- 如果 `SELECT`，以下行是输出，假设值 `bathroom interior design`、`2166`、`$3` 已存在于表中的列 `Search phrase`、`count`、`ad price` 下。  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

设置 `format_template_rows_between_delimiter` 指定行之间的分隔符，该分隔符在每行结束后打印（或期望）除了最后一行以外的每一行（默认是 `\n`）。

### format_template_resultset {#format_template_resultset}

设置 `format_template_resultset` 指定包含结果集格式字符串的文件路径。

结果集的格式字符串具有与行格式字符串相同的语法。它允许指定前缀、后缀以及打印一些额外信息的方式，并包含如下占位符而不是列名：

- `data` 是以 `format_template_row` 格式表示的具有数据的行，使用 `format_template_rows_between_delimiter` 分隔。此占位符必须是格式字符串中的第一个占位符。
- `totals` 是以 `format_template_row` 格式表示的总值行（当使用 WITH TOTALS 时）。
- `min` 是以 `format_template_row` 格式表示的最小值行（当 extremes 设置为 1 时）。
- `max` 是以 `format_template_row` 格式表示的最大值行（当 extremes 设置为 1 时）。
- `rows` 是输出行的总数。
- `rows_before_limit` 是在没有 LIMIT 的情况下最少会有的行数。仅在查询包含 LIMIT 时输出。如果查询包含 GROUP BY，rows_before_limit_at_least 是在没有 LIMIT 的情况下确切的行数。
- `time` 是请求执行时间（以秒为单位）。
- `rows_read` 是已读取的行数。
- `bytes_read` 是已读取的字节数（未压缩）。

占位符 `data`、`totals`、`min` 和 `max` 不得指定转义规则（或必须显式指定为 `None`）。其他占位符可以指定任何转义规则。

:::note
如果 `format_template_resultset` 设置为空字符串，则使用 `${data}` 作为默认值。
:::

对于插入查询，格式允许在前缀或后缀下跳过某些列或字段（见示例）。

### 内联规范 {#inline_specification}

有时很难或不可能将格式配置（通过 `format_template_row`、`format_template_resultset` 设置）部署到集群中所有节点的目录。 此外，格式可能非常简单，以至于不需要放置在文件中。

对于这些情况，可以使用 `format_template_row_format`（用于 `format_template_row`）和 `format_template_resultset_format`（用于 `format_template_resultset`）直接在查询中设置模板字符串，而不是作为包含其路径的文件。

:::note
格式字符串和转义序列的规则与以下内容相同：
- [`format_template_row`](#format_template_row) 在使用 `format_template_row_format` 时。
- [`format_template_resultset`](#format_template_resultset) 在使用 `format_template_resultset_format` 时。
:::

## 示例用法 {#example-usage}

让我们看两个如何使用 `Template` 格式的示例，首先是选择数据，然后是插入数据。

### 选择数据 {#selecting-data}

``` sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Max</caption>
    ${max}
  </table>
  <b>Processed ${rows_read:XML} rows in ${time:XML} sec</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

结果：

```html
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>Max</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>Processed 3095973 rows in 0.1569913 sec</b>
 </body>
</html>
```

### 插入数据 {#inserting-data}

``` text
Some header
Page views: 5, User id: 4324182021466249494, Useless field: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Useless field: world, Duration: 185, Sign: 1
Total rows: 2
```

``` sql
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

`PageViews`、`UserID`、`Duration` 和 `Sign` 内的占位符是表中的列名。 行中的 `Useless field` 后的值以及后缀中 `\nTotal rows:` 后的值将被忽略。 输入数据中的所有分隔符必须严格等于指定格式字符串中的分隔符。

### 内联规范 {#in-line-specification}

厌倦了手动格式化 markdown 表格？在这个例子中，我们将看看如何使用 `Template` 格式和内联规范设置完成一个简单的任务 - 从 `system.formats` 表中 `SELECT` 一些 ClickHouse 格式的名称并将其格式化为 markdown 表格。这可以很容易地通过使用 `Template` 格式和设置 `format_template_row_format` 和 `format_template_resultset_format` 来实现。

在之前的示例中，我们将结果集和行格式字符串指定在单独的文件中，使用 `format_template_resultset` 和 `format_template_row` 设置分别指定到这些文件的路径。这里我们将以内联方式做，因为我们的模板很简单，仅由几个 `|` 和 `-` 组成以制作 markdown 表格。我们使用设置 `format_template_resultset_format` 来指定结果集模板字符串，前面添加了 `|ClickHouse Formats|\n|---|\n` 来构建表头。我们使用设置 `format_template_row_format` 来指定我们的行模板字符串 `` |`{0:XML}`| ``。 `Template` 格式会将我们的行以给定的格式插入到占位符 `${data}` 中。在这个例子中我们只有一列，但如果你想添加更多，你可以通过添加 `{1:XML}`、`{2:XML}`... 等到你的行模板字符串中来完成，选择适当的转义规则。在这个例子中，我们选择了转义规则 `XML`。 

```sql title="查询"
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

看看这个！我们省去了要手动添加所有那些 `|` 和 `-` 以制作 markdown 表格的麻烦：

```response title="响应"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
