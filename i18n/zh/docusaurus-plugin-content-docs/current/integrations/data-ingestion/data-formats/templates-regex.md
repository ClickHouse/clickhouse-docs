---
'sidebar_label': '正则表达式和模板'
'sidebar_position': 3
'slug': '/integrations/data-formats/templates-regexp'
'title': '在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本数据'
'description': '页面描述了如何在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本'
---


# 使用模板和正则表达式在 ClickHouse 中导入和导出自定义文本数据

我们经常需要处理自定义文本格式的数据。这可能是非标准格式、无效 JSON 或损坏的 CSV。使用像 CSV 或 JSON 这样的标准解析器在所有情况下都无法正常工作。但是，ClickHouse 为我们提供了强大的模板和正则表达式格式。

## 基于模板的导入 {#importing-based-on-a-template}
假设我们想从以下 [日志文件](assets/error.log) 导入数据：

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

我们可以使用 [Template](/interfaces/formats.md/#format-template) 格式来导入这些数据。我们必须定义一个模板字符串，其中包含每行输入数据的值占位符：

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

让我们创建一个表来导入我们的数据：
```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `request` String
)
ENGINE = MergeTree
ORDER BY (host, request, time)
```

要使用给定模板导入数据，我们必须将我们的模板字符串保存在一个文件中（在我们的例子中是 [row.template](assets/row.template)）：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

我们在 `${name:escaping}` 格式中定义列的名称和转义规则。这里提供了多个选项，例如 CSV、JSON、Escaped 或 Quoted，它们实现了 [各自的转义规则](/interfaces/formats.md/#format-template)。

现在我们可以将给定的文件作为 `format_template_row` 设置选项的参数，在导入数据时使用（*注意，模板和数据文件 **不应该有** 多余的 `\n` 符号在文件末尾*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

我们可以确保我们的数据已成功加载到表中：

```sql
SELECT
    request,
    count(*)
FROM error_log
GROUP BY request
```
```response
┌─request──────────────────────────────────────────┬─count()─┐
│ GET /img/close.png HTTP/1.1                      │     176 │
│ GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1 │     172 │
│ GET /phone/images/icon_01.png HTTP/1.1           │     139 │
│ GET /apple-touch-icon-precomposed.png HTTP/1.1   │     161 │
│ GET /apple-touch-icon.png HTTP/1.1               │     162 │
│ GET /apple-touch-icon-120x120.png HTTP/1.1       │     190 │
└──────────────────────────────────────────────────┴─────────┘
```

### 跳过空格 {#skipping-whitespaces}
考虑使用 [TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces)，它允许在模板的分隔符之间跳过空格：
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## 使用模板导出数据 {#exporting-data-using-templates}

我们也可以使用模板将数据导出到任何文本格式。在这种情况下，我们必须创建两个文件：

[结果集模板](assets/output.results)，它定义了整个结果集的布局：

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

这里，`rows_read` 和 `time` 是每个请求的系统指标。`data` 代表生成的行（`${data}` 应始终作为此文件中的第一个占位符），基于在 [**行模板文件**](assets/output.rows) 中定义的模板：

```response
${ip:Escaped} generated ${total:Escaped} requests
```

现在让我们使用这些模板来导出以下查询：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Top 10 IPs ==

9.8.4.6 generated 3 requests
9.5.1.1 generated 3 requests
2.4.8.9 generated 3 requests
4.8.8.2 generated 3 requests
4.5.4.4 generated 3 requests
3.3.6.4 generated 2 requests
8.9.5.9 generated 2 requests
2.5.1.8 generated 2 requests
6.8.3.6 generated 2 requests
6.6.3.5 generated 2 requests

--- 1000 rows read in 0.001380604 ---
```

### 导出到 HTML 文件 {#exporting-to-html-files}
基于模板的结果还可以使用 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 子句导出到文件。让我们根据给定的 [resultset](assets/html.results) 和 [row](assets/html.row) 格式生成 HTML 文件：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
INTO OUTFILE 'out.html'
FORMAT Template
SETTINGS format_template_resultset = 'html.results',
         format_template_row = 'html.row'
```

### 导出到 XML {#exporting-to-xml}

模板格式可用于生成所有想象中的文本格式文件，包括 XML。只需放置相关模板并进行导出。

还可以考虑使用 [XML](/interfaces/formats.md/#xml) 格式，以获取包括元数据在内的标准 XML 结果：

```sql
SELECT *
FROM error_log
LIMIT 3
FORMAT XML
```
```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
        <meta>
                <columns>
                        <column>
                                <name>time</name>
                                <type>DateTime</type>
                        </column>
                        ...
                </columns>
        </meta>
        <data>
                <row>
                        <time>2023-01-15 13:00:01</time>
                        <ip>3.5.9.2</ip>
                        <host>example.com</host>
                        <request>GET /apple-touch-icon-120x120.png HTTP/1.1</request>
                </row>
                ...
        </data>
        <rows>3</rows>
        <rows_before_limit_at_least>1000</rows_before_limit_at_least>
        <statistics>
                <elapsed>0.000745001</elapsed>
                <rows_read>1000</rows_read>
                <bytes_read>88184</bytes_read>
        </statistics>
</result>

```

## 基于正则表达式导入数据 {#importing-data-based-on-regular-expressions}

[Regexp](/interfaces/formats.md/#data-format-regexp) 格式解决了更复杂的情况，当输入数据需要以更复杂的方式解析时。让我们解析我们的 [error.log](assets/error.log) 示例文件，但这次捕获文件名和协议，以将它们保存到单独的列中。首先，让我们为此准备一个新表：

```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `file` String,
    `protocol` String
)
ENGINE = MergeTree
ORDER BY (host, file, time)
```

现在我们可以基于正则表达式导入数据：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse 将根据捕获组的顺序将数据插入到相关列中。让我们查看数据：

```sql
SELECT * FROM error_log LIMIT 5
```
```response
┌────────────────time─┬─ip──────┬─host────────┬─file─────────────────────────┬─protocol─┐
│ 2023-01-15 13:00:01 │ 3.5.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:01:40 │ 3.7.2.5 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:16:49 │ 9.2.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:21:38 │ 8.8.5.3 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:31:27 │ 9.5.8.4 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
└─────────────────────┴─────────┴─────────────┴──────────────────────────────┴──────────┘
```

默认情况下，如果有未匹配的行，ClickHouse 会引发错误。如果你想跳过未匹配的行，可以使用 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 选项来启用它：

```sql
SET format_regexp_skip_unmatched = 1;
```

## 其他格式 {#other-formats}

ClickHouse 支持多种格式，包括文本和二进制格式，以覆盖各种场景和平台。在以下文章中探索更多格式和使用方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正则表达式和模板**
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个便携式全功能工具，用于处理本地/远程文件，无需 Clickhouse 服务器。
