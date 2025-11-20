---
sidebar_label: '正则表达式与模板'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: '在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本数据'
description: '介绍如何在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本数据的页面'
doc_type: 'guide'
keywords: ['data formats', 'templates', 'regex', 'custom formats', 'parsing']
---



# 使用 ClickHouse 中的 Template 和 Regex 导入与导出自定义文本数据

我们经常需要处理自定义文本格式的数据，这些数据可能采用非标准格式、包含无效的 JSON，或者是损坏的 CSV。在这类场景下，使用 CSV 或 JSON 等标准解析器并不总是有效。不过，ClickHouse 提供了功能强大的 Template 和 Regex 格式，可以很好地应对这些情况。



## 基于模板导入数据 {#importing-based-on-a-template}

假设我们要从以下[日志文件](assets/error.log)导入数据:

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

我们可以使用 [Template](/interfaces/formats/Template) 格式来导入这些数据。需要为输入数据的每一行定义一个包含值占位符的模板字符串:

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

首先创建一个表来导入数据:

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

要使用给定的模板导入数据,需要将模板字符串保存到文件中(在本例中为 [row.template](assets/row.template)):

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

我们以 `${name:escaping}` 格式定义列名和转义规则。这里提供了多个选项,如 CSV、JSON、Escaped 或 Quoted,它们实现了[相应的转义规则](/interfaces/formats/Template)。

现在可以在导入数据时将该文件作为 `format_template_row` 设置选项的参数(_注意,模板文件和数据文件**不应该**在文件末尾包含额外的 `\n` 符号_):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

然后可以验证数据是否已成功加载到表中:

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

### 跳过空白字符 {#skipping-whitespaces}

可以考虑使用 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces),它允许跳过模板中分隔符之间的空白字符:

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```


## 使用模板导出数据 {#exporting-data-using-templates}

我们也可以使用模板将数据导出为任意文本格式。在这种情况下,需要创建两个文件:

[结果集模板](assets/output.results),定义整个结果集的布局:

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

这里,`rows_read` 和 `time` 是每个请求可用的系统指标。`data` 代表生成的行(在此文件中 `${data}` 应始终作为第一个占位符),基于[**行模板文件**](assets/output.rows)中定义的模板:

```response
${ip:Escaped} generated ${total:Escaped} requests
```

现在让我们使用这些模板来导出以下查询:

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

基于模板的结果也可以使用 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 子句导出到文件。让我们基于给定的[结果集](assets/html.results)和[行](assets/html.row)格式生成 HTML 文件:

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

模板格式可用于生成各种文本格式文件,包括 XML。只需提供相应的模板并执行导出即可。

也可以考虑使用 [XML](/interfaces/formats/XML) 格式来获取包含元数据的标准 XML 结果:

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

[Regexp](/interfaces/formats/Regexp) 格式用于处理更复杂的场景,即需要以更复杂的方式解析输入数据。让我们解析 [error.log](assets/error.log) 示例文件,但这次捕获文件名和协议,将它们保存到单独的列中。首先,为此准备一个新表:

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

现在可以基于正则表达式导入数据:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse 将根据顺序将每个捕获组的数据插入到相应的列中。检查数据:

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

默认情况下,如果存在不匹配的行,ClickHouse 将抛出错误。如果想跳过不匹配的行,可以使用 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 选项启用:

```sql
SET format_regexp_skip_unmatched = 1;
```


## 其他格式 {#other-formats}

ClickHouse 支持多种文本和二进制格式,以满足各种应用场景和平台需求。您可以在以下文章中了解更多格式及其使用方法:

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正则表达式和模板**
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

另外,您还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 这是一个功能完整的便携式工具,无需 ClickHouse 服务器即可处理本地/远程文件。
