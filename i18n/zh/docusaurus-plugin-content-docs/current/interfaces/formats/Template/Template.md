---
'alias': []
'description': '模板格式的文档'
'input_format': true
'keywords':
- 'Template'
'output_format': true
'slug': '/interfaces/formats/Template'
'title': '模板'
'doc_type': 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

对于需要比其他标准格式提供更多自定义服务的情况，`Template` 格式允许用户指定自己的自定义格式字符串，并为值提供占位符，同时指定数据的转义规则。

它使用以下设置：

| 设置                                                                                                      | 描述                                                                                                                    |
|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 指定包含行格式字符串的文件路径。                                                                                     |
| [`format_template_resultset`](#format_template_resultset)                                                | 指定包含行格式字符串的文件路径                                                                                       |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 指定行之间的分隔符，默认为 `\n`，它在每行之后（除最后一行外）被打印（或期望的）。                                   |
| `format_template_row_format`                                                                             | 指定行的格式字符串 [行内](#inline_specification)。                                                                    |                                                                           
| `format_template_resultset_format`                                                                       | 指定结果集格式字符串 [行内](#inline_specification)。                                                                  |
| 其他格式的一些设置（例如`output_format_json_quote_64bit_integers` 在使用 `JSON` 转义时）                    |                                                                                                                        |

## 设置和转义规则 {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

设置 `format_template_row` 指定包含行格式字符串的文件路径，其语法如下：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

其中：

| 语法部分        | 描述                                                                                                        |
|----------------|-----------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 值之间的分隔符（`$` 符号可以转义为 `$$`）                                                                 |
| `column_i`     | 要选择或插入的列名或索引（如果为空，则跳过该列）                                                               |
| `serializeAs_i` | 列值的转义规则。                                                                                              |

以下转义规则受支持：

| 转义规则         | 描述                                      |
|-------------------|-------------------------------------------|
| `CSV`, `JSON`, `XML` | 与同名格式类似                       |
| `Escaped`         | 类似于 `TSV`                             |
| `Quoted`          | 类似于 `Values`                          |
| `Raw`             | 无转义，类似于 `TSVRaw`                 |   
| `None`            | 无转义规则 - 见下面的说明               |

:::note
如果省略转义规则，则使用 `None`。 `XML` 仅适合输出。
:::

我们来看一个例子。给定以下格式字符串：

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

以下值将被打印（如果使用 `SELECT`）或期望（如果使用 `INPUT`），
分别在 `Search phrase:`、 `, count:`、 `, ad price: $` 和 `;` 分隔符之间：

- `s`（转义规则为 `Quoted`）
- `c`（转义规则为 `Escaped`）
- `p`（转义规则为 `JSON`）

例如：

- 如果执行 `INSERT`，以下行符合期望模板，将值 `bathroom interior design`、 `2166`、 `$3` 读入列 `Search phrase`、 `count`、 `ad price`。
- 如果执行 `SELECT`，则以下行是输出，假设值 `bathroom interior design`、 `2166`、 `$3` 已存储在列 `Search phrase`、 `count`、 `ad price` 中。

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

设置 `format_template_rows_between_delimiter` 指定行之间的分隔符，它在每行之后（除最后一行外）被打印（或期望的），默认为 `\n`。

### format_template_resultset {#format_template_resultset}

设置 `format_template_resultset` 指定包含结果集格式字符串的文件的路径。

结果集的格式字符串具有与行的格式字符串相同的语法。
它允许指定前缀、后缀和打印一些附加信息的方式，并包含以下占位符，而不是列名：

- `data` 是以 `format_template_row` 格式显示的数据行，以 `format_template_rows_between_delimiter` 分隔。此占位符必须是格式字符串中的第一个占位符。
- `totals` 是以 `format_template_row` 格式显示的总值行（使用 WITH TOTALS 时）。
- `min` 是以 `format_template_row` 格式显示的最小值行（当极值设置为 1 时）。
- `max` 是以 `format_template_row` 格式显示的最大值行（当极值设置为 1 时）。
- `rows` 是输出行的总数。
- `rows_before_limit` 是在没有 LIMIT 的情况下可能存在的最小行数。仅在查询包含 LIMIT 时输出。如果查询包含 GROUP BY，则 `rows_before_limit_at_least` 是没有 LIMIT 时的确切行数。
- `time` 是请求执行时间（以秒为单位）。
- `rows_read` 是读取的行数。
- `bytes_read` 是读取的字节数（未压缩）。

占位符 `data`、 `totals`、 `min` 和 `max` 必须不指定转义规则（或显式指定为 `None`）。其余占位符可以指定任何转义规则。

:::note
如果 `format_template_resultset` 设置为空字符串，则使用 `${data}` 作为默认值。
:::

对于插入查询，格式允许跳过某些列或字段，如果指定前缀或后缀（见例子）。

### 行内规范 {#inline_specification}

有时很难或不可能在集群中的所有节点上将格式配置（由 `format_template_row`、 `format_template_resultset` 设置）部署到一个目录。
此外，格式可能是如此简单，以至于不需要放置在文件中。

对于这些情况，可以使用 `format_template_row_format`（对于 `format_template_row`）和 `format_template_resultset_format`（对于 `format_template_resultset`），直接在查询中设置模板字符串，而不是作为包含它的文件路径。

:::note
格式字符串和转义序列的规则与以下内容相同：
- [`format_template_row`](#format_template_row) 在使用 `format_template_row_format` 时。
- [`format_template_resultset`](#format_template_resultset) 在使用 `format_template_resultset_format` 时。
:::

## 示例用法 {#example-usage}

让我们看两个关于如何使用 `Template` 格式的示例，首先用于选择数据，然后用于插入数据。

### 选择数据 {#selecting-data}

```sql
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

`PageViews`、 `UserID`、 `Duration` 和 `Sign` 的占位符是表中的列名。行中 `Useless field` 之后的值以及 `\nTotal rows:` 之后的值均会被忽略。
输入数据中的所有分隔符必须严格等于指定格式字符串中的分隔符。

### 行内规范 {#in-line-specification}

厌倦了手工格式化 markdown 表格吗？在这个例子中，我们将看看如何使用 `Template` 格式和行内规范设置来完成一个简单的任务 - 从 `system.formats` 表中 `SELECT` 一些 ClickHouse 格式的名称，并将其格式化为 markdown 表格。这可以通过使用 `Template` 格式以及设置 `format_template_row_format` 和 `format_template_resultset_format` 轻松实现。

在之前的示例中，我们在单独的文件中指定了结果集和行格式字符串，并使用 `format_template_resultset` 和 `format_template_row` 设置分别指定这些文件的路径。在这里，我们将进行行内设置，因为我们的模板很简单，仅由几个 `|` 和 `-` 组成，以制作 markdown 表格。我们将使用设置 `format_template_resultset_format` 来指定我们的结果集模板字符串。在 `${data}` 之前，我们添加了 `|ClickHouse Formats|\n|---|\n` 来制作表头。我们使用设置 `format_template_row_format` 来指定我们的行模板字符串 `` |`{0:XML}`| ``。`Template` 格式将以给定格式将我们的行插入到占位符 `${data}` 中。在这个例子中，我们只有一列，但如果你想添加更多列，可以通过在行模板字符串中添加 `{1:XML}`、 `{2:XML}`... 等来完成，选择适当的转义规则。在这个例子中，我们选择了转义规则 `XML`。

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

看看吧！我们节省了手动添加所有那些 `|` 和 `-` 的麻烦，以制作 markdown 表格：

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
