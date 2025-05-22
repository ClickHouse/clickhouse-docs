| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

对于需要比其他标准格式提供更多自定义的情况， 
`Template` 格式允许用户指定自己的自定义格式字符串，其中包含值的占位符，并为数据指定转义规则。

它使用以下设置：

| 设置                                                                                                    | 描述                                                                                                                        |
|--------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                          | 指定包含行格式字符串的文件路径。                                                                                           |
| [`format_template_resultset`](#format_template_resultset)                                              | 指定包含行格式字符串的文件路径                                                                                           |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                    | 指定行之间的分隔符，默认情况下在每行之后（除最后一行）打印（或期望）(`\n` 默认值)                                          |
| `format_template_row_format`                                                                            | 指定 [行](#inline_specification) 的格式字符串。                                                                             |                                                                           
| `format_template_resultset_format`                                                                      | 指定 [结果集](#inline_specification) 的格式字符串。                                                                        |
| 其他格式的一些设置（例如，当使用 `JSON` 转义时的 `output_format_json_quote_64bit_integers`）       |                                                                                                                            |

## 设置和转义规则 {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

设置 `format_template_row` 指定包含行格式字符串的文件路径，其语法如下：

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

其中：

| 语法部分      | 描述                                                                                                              |
|----------------|----------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 值之间的分隔符（`$` 符号可以转义为 `$$`）                                                                       |
| `column_i`     | 要选择或插入的列名或索引（如果为空，则跳过该列）                                                                  |
| `serializeAs_i` | 列值的转义规则。                                                                                               |

支持以下转义规则：

| 转义规则             | 描述                               |
|----------------------|-----------------------------------|
| `CSV`, `JSON`, `XML` | 与同名格式类似                    |
| `Escaped`            | 与 `TSV` 类似                      |
| `Quoted`             | 与 `Values` 类似                   |
| `Raw`                | 不进行转义，类似 `TSVRaw`         |   
| `None`               | 无转义规则 - 见下面的说明         |

:::note
如果省略了转义规则，则使用 `None`。 `XML` 仅适用于输出。
:::

我们来看一个例子。给定以下格式字符串：

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

将打印（如果使用 `SELECT`）或期望（如果使用 `INPUT`）以下值，列之间分别为 `Search phrase:`, `, count:`, `, ad price: $` 和 `;` 分隔符：

- `s`（转义规则为 `Quoted`）
- `c`（转义规则为 `Escaped`）
- `p`（转义规则为 `JSON`）

例如：

- 如果 `INSERT`，下面这一行与期望的模板匹配，并将值 `bathroom interior design`, `2166`, `$3` 读入列 `Search phrase`, `count`, `ad price`。
- 如果 `SELECT`，下面这一行将是输出，假设值 `bathroom interior design`, `2166`, `$3` 已经存储在一个表中，列为 `Search phrase`, `count`, `ad price`。  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

设置 `format_template_rows_between_delimiter` 指定行之间的分隔符，默认情况下在每行之后（除最后一行）打印（或期望）`（\n`）。

### format_template_resultset {#format_template_resultset}

设置 `format_template_resultset` 指定包含结果集格式字符串的文件路径。

结果集的格式字符串与行的格式字符串具有相同的语法。 
它允许指定前缀、后缀和打印一些附加信息的方式，并包含以下占位符而不是列名：

- `data` 是以 `format_template_row` 格式的数据行，由 `format_template_rows_between_delimiter` 分隔。 此占位符必须是格式字符串中的第一个占位符。
- `totals` 是以 `format_template_row` 格式的总值行（当使用 WITH TOTALS 时）。
- `min` 是以 `format_template_row` 格式的最小值行（当极端值设置为 1 时）。
- `max` 是以 `format_template_row` 格式的最大值行（当极端值设置为 1 时）。
- `rows` 是输出行的总数。
- `rows_before_limit` 是没有限制时的最小行数。 仅在查询包含 LIMIT 时输出。 如果查询包含 GROUP BY，rows_before_limit_at_least 是没有 LIMIT 时的确切行数。
- `time` 是请求执行时间（秒）。
- `rows_read` 是已读取的行数。
- `bytes_read` 是已读取的字节数（未压缩）。

占位符 `data`、`totals`、`min` 和 `max` 不得指定转义规则（或必须明确指定为 `None`）。 其余占位符可以指定任何转义规则。

:::note
如果 `format_template_resultset` 设置为空字符串， `${data}` 被用作默认值。
:::

对于插入查询，格式允许跳过某些列或字段如果前缀或后缀（见例子）。

### 行内规范 {#inline_specification}

有时将格式配置（由 `format_template_row`、`format_template_resultset` 设置）部署到集群中所有节点的目录是具有挑战性的或不可能的。 
此外，格式可能如此简单，以至于不需要放置在文件中。

对于这些情况，可以使用 `format_template_row_format`（用于 `format_template_row`）和 `format_template_resultset_format`（用于 `format_template_resultset`）直接在查询中设置模板字符串，而不是将其作为包含该字符串的文件的路径。

:::note
格式字符串和转义序列的规则与以下规则相同：
- [`format_template_row`](#format_template_row) 在使用 `format_template_row_format` 时。
- [`format_template_resultset`](#format_template_resultset) 在使用 `format_template_resultset_format` 时。
:::

## 示例用法 {#example-usage}

我们来看两个如何使用 `Template` 格式的示例，首先用于选择数据，然后用于插入数据。

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

`PageViews`、`UserID`、`Duration` 和 `Sign` 在占位符中是表中的列名。 行内 `Useless field` 后面的值和后缀 `\nTotal rows:` 后面的值将被忽略。
输入数据中的所有分隔符必须与指定格式字符串中的分隔符完全相同。

### 行内规范 {#in-line-specification}

厌倦了手动格式化 markdown 表格？ 在这个示例中，我们将看看如何使用 `Template` 格式和行内规范设置来完成一个简单的任务 - 从 `system.formats` 表中选择一些 ClickHouse 格式的名称并将其格式化为 markdown 表。 使用 `Template` 格式和设置 `format_template_row_format` 和 `format_template_resultset_format` 可以轻松实现这一点。

在之前的示例中，我们分别在单独的文件中指定了结果集和行格式字符串，并且使用 `format_template_resultset` 和 `format_template_row` 设置指定了这些文件的路径。 在这里，我们将其行内处理，因为我们的模板是简单的，仅由几个 `|` 和 `-` 组成，以制作 markdown 表。 我们使用设置 `format_template_resultset_format` 来指定结果集模板字符串。 为了制作表头，我们在 `${data}` 之前添加了 `|ClickHouse Formats|\n|---|\n`。 我们使用设置 `format_template_row_format` 来指定我们的行模板字符串 `` |`{0:XML}`| ``。 `Template` 格式将以给定格式将我们的行插入到占位符 `${data}` 中。 在这个示例中，我们只有一列，但是如果想添加更多列，可以通过在行模板字符串中添加 `{1:XML}`、`{2:XML}` 等来实现，选择适当的转义规则。 在这个示例中，我们采用了转义规则 `XML`。

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

看到了吗！ 我们省去了手动添加所有 `|` 和 `-` 制作 markdown 表的麻烦。:

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
