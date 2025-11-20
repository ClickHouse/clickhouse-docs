---
slug: /faq/integration/json-import
title: '如何将 JSON 导入 ClickHouse？'
toc_hidden: true
toc_priority: 11
description: '本页介绍如何将 JSON 导入 ClickHouse'
keywords: ['JSON import', 'JSONEachRow format', 'data import', 'JSON ingestion', 'data formats']
doc_type: 'guide'
---



# 如何将 JSON 导入 ClickHouse？ {#how-to-import-json-into-clickhouse}

ClickHouse 支持多种[输入和输出数据格式](/interfaces/formats)。其中包含多种 JSON 变体,但数据导入最常用的格式是 [JSONEachRow](/interfaces/formats/JSONEachRow)。该格式要求每行包含一个 JSON 对象,对象之间用换行符分隔。


## 示例 {#examples}

使用 [HTTP 接口](../../interfaces/http.md):

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

使用 [CLI 接口](../../interfaces/cli.md):

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

除了手动插入数据,您也可以考虑使用[集成工具](../../integrations/index.mdx)。


## 有用的设置 {#useful-settings}

- `input_format_skip_unknown_fields` 允许插入 JSON 数据,即使其中包含表结构中不存在的额外字段(这些字段会被丢弃)。
- `input_format_import_nested_json` 允许将嵌套的 JSON 对象插入到 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 类型的列中。

:::note
设置可以通过 HTTP 接口的 `GET` 参数指定,或者在 `CLI` 接口中作为带有 `--` 前缀的额外命令行参数指定。
:::
