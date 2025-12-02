---
sidebar_label: '正则表达式与模板'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: '在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本数据'
description: '本页介绍如何在 ClickHouse 中使用模板和正则表达式导入和导出自定义文本'
doc_type: 'guide'
keywords: ['数据格式', '模板', '正则表达式', '自定义格式', '解析']
---



# 在 ClickHouse 中使用 Templates 和 Regex 导入与导出自定义文本数据 {#importing-and-exporting-custom-text-data-using-templates-and-regex-in-clickhouse}

我们经常需要处理自定义文本格式的数据，这些数据可能是非标准格式、无效的 JSON，或损坏的 CSV。在这些情况下，使用 CSV 或 JSON 等标准解析器并不总是可行。好在 ClickHouse 提供了功能强大的 Template 和 Regex 格式，可以很好地应对这些场景。



## 基于模板导入 {#importing-based-on-a-template}

假设我们要从以下[日志文件](assets/error.log)中导入数据：

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

我们可以使用 [Template](/interfaces/formats/Template) 格式来导入这些数据。我们需要为输入数据的每一行定义一个包含值占位符的模板字符串：

```response
<time> [error] 客户端：<ip>，服务器：<host> "<request>"
```

接下来创建一个表用于导入数据：

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

要使用指定模板导入数据，我们需要将模板字符串保存在一个文件中（在本例中为 [row.template](assets/row.template)）：

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

我们使用 `${name:escaping}` 格式来定义列的名称和转义规则。这里可以使用多种选项，例如 CSV、JSON、Escaped 或 Quoted，它们分别实现了[相应的转义规则](/interfaces/formats/Template)。

现在在导入数据时，可以将该文件作为 `format_template_row` 配置项的参数来使用（*注意：模板文件和数据文件在文件末尾**不应包含**额外的 `\n` 符号*）：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

接下来可以确认数据是否已加载到表中：

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

建议使用 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)，它可以忽略模板中分隔符之间的空白字符：

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```


## 使用模板导出数据 {#exporting-data-using-templates}

我们也可以使用模板将数据导出为任何文本格式。在这种情况下，我们需要创建两个文件：

[结果集模板](assets/output.results)，用于定义整个结果集的布局：

```response
== 前 10 个 IP ==
${data}
--- 已读取 ${rows_read:XML} 行,耗时 ${time:XML} ---
```

这里，`rows_read` 和 `time` 是每个请求都可用的系统指标。而 `data` 表示生成的行（`${data}` 在此文件中应始终作为第一个占位符），其内容基于 [**row template 文件**](assets/output.rows) 中定义的模板生成：

```response
${ip:Escaped} 产生了 ${total:Escaped} 个请求
```

现在让我们使用这些模板导出下面这个查询：

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== 前 10 个 IP ==

9.8.4.6 产生了 3 个请求
9.5.1.1 产生了 3 个请求
2.4.8.9 产生了 3 个请求
4.8.8.2 产生了 3 个请求
4.5.4.4 产生了 3 个请求
3.3.6.4 产生了 2 个请求
8.9.5.9 产生了 2 个请求
2.5.1.8 产生了 2 个请求
6.8.3.6 产生了 2 个请求
6.6.3.5 产生了 2 个请求

--- 已读取 1000 行，用时 0.001380604 秒 ---
```

### 导出为 HTML 文件 {#exporting-to-html-files}

基于模板的结果也可以使用 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 子句导出到文件。我们来基于给定的 [结果集](assets/html.results) 和 [行](assets/html.row) 格式生成 HTML 文件：

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

### 导出为 XML {#exporting-to-xml}

模板格式可用于生成几乎所有可以想象的文本格式文件，包括 XML。只需准备相应的模板并执行导出即可。

也可以考虑使用 [XML](/interfaces/formats/XML) 格式来获得包含元数据在内的标准 XML 结果：

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

[Regexp](/interfaces/formats/Regexp) 格式适用于需要以更复杂方式解析输入数据的场景。我们再次解析 [error.log](assets/error.log) 示例文件，不过这次要提取文件名和协议，并将它们保存到单独的列中。首先，为此准备一张新表：

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

现在我们可以通过正则表达式导入数据：

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse 会根据每个捕获组在正则中的顺序，将其对应的数据插入到相应的列中。让我们检查一下数据：

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

默认情况下，ClickHouse 在出现不匹配行时会引发错误。如果你希望改为跳过不匹配的行，请通过 [format&#95;regexp&#95;skip&#95;unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 选项将其启用：

```sql
SET format_regexp_skip_unmatched = 1;
```


## 其他格式 {#other-formats}

ClickHouse 引入了对多种文本和二进制格式的支持，以覆盖各种使用场景和平台。请在以下文章中了解更多格式以及与这些格式协同工作的方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- **正则表达式和模板**
- [Native 与二进制格式](binary.md)
- [SQL 格式](sql.md)

还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一款可移植、功能完备的工具，无需 ClickHouse 服务器即可处理本地或远程文件。
