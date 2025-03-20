---
sidebar_label: 正则表达式和模板
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
---


# 使用模板和正则表达式在 ClickHouse 中导入和导出自定义文本数据

我们经常需要处理自定义文本格式的数据。这可能是非标准格式、无效的 JSON 或损坏的 CSV。使用像 CSV 或 JSON 这样的标准解析器在所有情况下都不奏效。但 ClickHouse 提供了强大的模板和正则表达式格式来解决这个问题。

## 基于模板的导入 {#importing-based-on-a-template}
假设我们想从以下 [日志文件](assets/error.log) 中导入数据：

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

我们可以使用 [模板](/interfaces/formats.md/#format-template) 格式导入这些数据。我们需要定义一个模板字符串，其中包含每行输入数据的值占位符：

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

要使用给定模板导入数据，我们必须将模板字符串保存在一个文件中（在我们的例子中为 [row.template](assets/row.template)）：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

我们在 `${name:escaping}` 格式中定义了列的名称和转义规则。此处可以使用多种选项，如 CSV、JSON、Escaped 或 Quoted，它们实现了相应的 [转义规则](/interfaces/formats.md/#format-template)。

现在我们可以在导入数据时将给定文件作为 `format_template_row` 设置选项的参数（*注意，模板和数据文件 **不应** 在文件末尾有额外的 `\n` 符号*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

我们可以确认我们的数据已加载到表中：

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
可以考虑使用 [TemplateIgnoreSpaces](/interfaces/formats.md/#templateignorespaces) 来跳过模板中定界符之间的空格：
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## 使用模板导出数据 {#exporting-data-using-templates}

我们还可以使用模板将数据导出为任何文本格式。在这种情况下，我们需要创建两个文件：

[结果集模板](assets/output.results)，定义整个结果集的布局：

```response
== 前 10 个 IP ==
${data}
--- ${rows_read:XML} 行在 ${time:XML} 中被读取 ---
```

这里，`rows_read` 和 `time` 是每个请求可用的系统指标。而 `data` 代表生成的行（`${data}` 应该始终是该文件中的第一个占位符），基于在 [**行模板文件**](assets/output.rows) 中定义的模板：

```response
${ip:Escaped} 生成了 ${total:Escaped} 个请求
```

现在让我们使用这些模板导出以下查询：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== 前 10 个 IP ==

9.8.4.6 生成了 3 个请求
9.5.1.1 生成了 3 个请求
2.4.8.9 生成了 3 个请求
4.8.8.2 生成了 3 个请求
4.5.4.4 生成了 3 个请求
3.3.6.4 生成了 2 个请求
8.9.5.9 生成了 2 个请求
2.5.1.8 生成了 2 个请求
6.8.3.6 生成了 2 个请求
6.6.3.5 生成了 2 个请求

--- 1000 行在 0.001380604 中被读取 ---
```

### 导出到 HTML 文件 {#exporting-to-html-files}
基于模板的结果也可以使用 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 子句导出到文件。让我们基于给定的 [结果集](assets/html.results) 和 [行](assets/html.row) 格式生成 HTML 文件：

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

模板格式可以用来生成所有想象中的文本格式文件，包括 XML。只需放入相关模板并进行导出。

此外，还可以考虑使用 [XML](/interfaces/formats.md/#xml) 格式以获取包括元数据在内的标准 XML 结果：

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

[Regexp](/interfaces/formats.md/#data-format-regexp) 格式处理输入数据需要以更复杂的方式进行解析的更复杂情况。让我们解析我们的 [error.log](assets/error.log) 示例文件，但这次捕获文件名和协议，将其保存在单独的列中。首先，让我们为此准备一个新的表：

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

现在，我们可以基于正则表达式导入数据：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse 将根据每个捕获组的顺序将数据插入到相应的列中。让我们检查数据：

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

默认情况下，如果存在不匹配的行，ClickHouse 将会引发错误。如果您想跳过不匹配的行，请使用 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 选项启用它：

```sql
SET format_regexp_skip_unmatched = 1;
```

## 其他格式 {#other-formats}

ClickHouse 引入了对多种格式的支持，包括文本和二进制，以覆盖各种场景和平台。您可以在以下文章中探索更多格式及其工作方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正则表达式和模板**
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

另外，请查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个可移植的功能齐全的工具，可用于处理本地/远程文件，无需 ClickHouse 服务器。

