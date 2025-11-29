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

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

在需要比其他标准格式更高的自定义能力时，
可以使用 `Template` 格式，让用户指定带有值占位符的自定义格式字符串，
并为数据指定转义规则。

它使用以下设置：

| Setting                                                                                                  | Description                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 指定包含行格式字符串的文件路径。                                                                                           |
| [`format_template_resultset`](#format_template_resultset)                                                | 指定包含结果集行格式字符串的文件路径。                                                                                     |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 指定行与行之间的分隔符，它会在每一行（除最后一行）之后被打印（或被期望读取）（默认值为 `\n`）。                            |
| `format_template_row_format`                                                                             | 指定[内联](#inline_specification)的行格式字符串。                                                                          |                                                                           
| `format_template_resultset_format`                                                                       | 指定[内联](#inline_specification)的结果集格式字符串。                                                                      |
| 某些其他格式的设置（例如使用 `JSON` 转义时的 `output_format_json_quote_64bit_integers`）                |                                                                                                                            |



## 设置和转义规则 {#settings-and-escaping-rules}

### format&#95;template&#95;row {#format_template_row}

`format_template_row` 设置指定包含行格式字符串的文件路径，该文件中行格式字符串的语法如下：

```text
分隔符_1${列_1:序列化为_1}分隔符_2${列_2:序列化为_2} ... 分隔符_N
```

其中：

| Part of syntax  | Description                  |
| --------------- | ---------------------------- |
| `delimiter_i`   | 值之间的分隔符（`$` 符号可以通过 `$$` 转义）  |
| `column_i`      | 要选择或插入其值的列名或列索引（如果为空，则会跳过该列） |
| `serializeAs_i` | 列值所使用的转义规则。                  |

支持以下转义规则：

| Escaping Rule        | Description        |
| -------------------- | ------------------ |
| `CSV`, `JSON`, `XML` | 与同名格式的行为类似         |
| `Escaped`            | 类似于 `TSV`          |
| `Quoted`             | 类似于 `Values`       |
| `Raw`                | 不进行转义，类似于 `TSVRaw` |
| `None`               | 不使用转义规则 —— 详见下文说明  |

:::note
如果省略转义规则，则会使用 `None`。`XML` 仅适用于输出。
:::

下面通过一个示例来说明。给定如下格式字符串：

```text
搜索词组:${s:Quoted},数量:${c:Escaped},广告价格:$$${p:JSON};
```

以下值将在列标记 `Search phrase:`、`, count:`、`, ad price: $` 和分隔符 `;` 之间依次被输出（如果使用 `SELECT`）或被期望作为输入提供（如果使用 `INPUT`）：

* `s`（转义规则为 `Quoted`）
* `c`（转义规则为 `Escaped`）
* `p`（转义规则为 `JSON`）

例如：

* 如果执行 `INSERT`，下方这一行与预期模板匹配，并会将值 `bathroom interior design`、`2166`、`$3` 写入到列 `Search phrase`、`count`、`ad price` 中。
* 如果执行 `SELECT`，在值 `bathroom interior design`、`2166`、`$3` 已经存储在表的 `Search phrase`、`count`、`ad price` 列中的前提下，下方这一行就是输出结果。

```yaml
搜索词组：'bathroom interior design'，数量：2166，广告价格：$3;
```

### format&#95;template&#95;rows&#95;between&#95;delimiter {#format_template_rows_between_delimiter}

`format_template_rows_between_delimiter` 设置用于指定行与行之间的分隔符，该分隔符会在每一行（除了最后一行）之后输出（默认是 `\n`）。

### format&#95;template&#95;resultset {#format_template_resultset}

`format_template_resultset` 设置用于指定包含结果集格式字符串的文件路径。

结果集的格式字符串与行的格式字符串具有相同的语法。
它允许指定前缀、后缀以及打印一些附加信息的方式，并包含以下用来替代列名的占位符：

* `data` 是以 `format_template_row` 格式表示的数据行，并由 `format_template_rows_between_delimiter` 分隔。此占位符必须是格式字符串中的第一个占位符。
* `totals` 是以 `format_template_row` 格式表示的总计值行（使用 WITH TOTALS 时）。
* `min` 是以 `format_template_row` 格式表示的最小值行（当 extremes 被设置为 1 时）。
* `max` 是以 `format_template_row` 格式表示的最大值行（当 extremes 被设置为 1 时）。
* `rows` 是输出行的总数。
* `rows_before_limit` 是在没有 LIMIT 的情况下本应返回的最小可能行数。仅在查询包含 LIMIT 时输出。如果查询包含 GROUP BY，则 rows&#95;before&#95;limit&#95;at&#95;least 是在没有 LIMIT 时本应返回行数的精确值。
* `time` 是请求的执行时间（秒）。
* `rows_read` 是已读取的行数。
* `bytes_read` 是已读取的字节数（未压缩）。

占位符 `data`、`totals`、`min` 和 `max` 不得指定转义规则（或者必须显式指定为 `None`）。其余占位符可以指定任意转义规则。

:::note
如果 `format_template_resultset` 设置为空字符串，则默认使用 `${data}`。
:::


对于 INSERT 查询，如果存在前缀或后缀（见示例），该格式允许省略某些列或字段。

### 内联指定 {#inline_specification}

在很多情况下，要将模板格式所需的格式配置
（由 `format_template_row`、`format_template_resultset` 设定）部署到集群中所有节点的某个目录是非常困难的，甚至是不可能的。 
此外，某些格式可能非常简单，以至于不需要单独存放在文件中。

在这些情况下，可以使用 `format_template_row_format`（对应 `format_template_row`）和 `format_template_resultset_format`（对应 `format_template_resultset`）在查询中直接设置模板字符串，
而不是指定包含该模板的文件路径。

:::note
格式字符串和转义序列的规则与以下情况相同：
- 使用 `format_template_row_format` 时，对应 [`format_template_row`](#format_template_row)。
- 使用 `format_template_resultset_format` 时，对应 [`format_template_resultset`](#format_template_resultset)。
:::



## 示例用法 {#example-usage}

让我们来看两个关于如何使用 `Template` 格式的示例，首先是用于查询数据，其次是用于插入数据。

### 查询数据 {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>搜索词组</title> </head>
 <body>
  <table border="1"> <caption>搜索词组</caption>
    <tr> <th>搜索词组</th> <th>次数</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>最大值</caption>
    ${max}
  </table>
  <b>已处理 ${rows_read:XML} 行，耗时 ${time:XML} 秒</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

结果：

```html
<!DOCTYPE HTML>
<html> <head> <title>搜索词组</title> </head>
 <body>
  <table border="1"> <caption>搜索词组</caption>
    <tr> <th>搜索词组</th> <th>次数</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>最大值</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>已处理 3095973 行，耗时 0.1569913 秒</b>
 </body>
</html>
```

### 写入数据 {#inserting-data}

```text
某个标题
页面浏览量:5,用户 ID:4324182021466249494,无用字段:hello,持续时间:146,符号:-1
页面浏览量:6,用户 ID:4324182021466249494,无用字段:world,持续时间:185,符号:1
总行数:2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
标题\n${data}\n总行数：${:CSV}\n
```

```text title="/some/path/row.format"
页面浏览量: ${PageViews:CSV}, 用户 ID: ${UserID:CSV}, 无用字段: ${:CSV}, 持续时间: ${Duration:CSV}, 签名: ${Sign:CSV}
```

占位符中的 `PageViews`、`UserID`、`Duration` 和 `Sign` 是表中的列名。行中 `Useless field` 之后的值，以及后缀中 `\nTotal rows:` 之后的值将被忽略。
输入数据中的所有分隔符必须与指定格式字符串中的分隔符完全一致。

### 内联规格 {#in-line-specification}

厌倦了手动编写和排版 Markdown 表格？在本示例中，我们将介绍如何使用 `Template` 格式和内联规格设置来完成一个简单任务——从 `system.formats` 表中 `SELECT` 出若干 ClickHouse 格式的名称，并将它们格式化为 Markdown 表格。通过使用 `Template` 格式以及 `format_template_row_format` 和 `format_template_resultset_format` 设置，即可轻松实现这一点。


在之前的示例中，我们将结果集和行格式字符串放在单独的文件中，并分别通过设置 `format_template_resultset` 和 `format_template_row` 来指定这些文件的路径。这里我们会直接内联定义这些内容，因为我们的模板非常简单，只包含少量的 `|` 和 `-` 用于构造 Markdown 表格。我们将使用设置 `format_template_resultset_format` 来指定结果集模板字符串。为了生成表头，我们在 `${data}` 之前添加了 `|ClickHouse Formats|\n|---|\n`。我们使用设置 `format_template_row_format` 为每一行指定模板字符串 ``|`{0:XML}`|``。`Template` 格式会将按给定格式生成的行插入到占位符 `${data}` 中。在这个示例中我们只有一列，但如果你想添加更多列，可以在行模板字符串中添加 `{1:XML}`、`{2:XML}` 等，并根据需要选择合适的转义规则。在本示例中我们使用的是转义规则 `XML`。

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
 format_template_resultset_format='|ClickHouse 格式|\n|---|\n${data}\n'
```

看看这个！我们不必再为构建那个 Markdown 表格而手动添加那些 `|` 和 `-` 了：

```response title="Response"
|ClickHouse 格式|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
