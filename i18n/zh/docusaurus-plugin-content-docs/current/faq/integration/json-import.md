---
'slug': '/faq/integration/json-import'
'title': '如何将JSON导入ClickHouse？'
'toc_hidden': true
'toc_priority': 11
'description': '本页面向您展示如何将JSON导入ClickHouse'
'doc_type': 'guide'
---


# 如何将 JSON 导入 ClickHouse？ {#how-to-import-json-into-clickhouse}

ClickHouse 支持广泛的 [输入和输出数据格式](../../interfaces/formats.md)。其中有多种 JSON 变体，但最常用于数据摄取的是 [JSONEachRow](../../interfaces/formats.md#jsoneachrow)。它期望每行有一个 JSON 对象，每个对象通过换行符分隔。

## 示例 {#examples}

使用 [HTTP 接口](../../interfaces/http.md):

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

使用 [CLI 接口](../../interfaces/cli.md):

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

您可以考虑使用 [集成工具](../../integrations/index.mdx) 而不是手动插入数据。

## 有用的设置 {#useful-settings}

- `input_format_skip_unknown_fields` 允许插入 JSON，即使有额外字段不在表模式中（通过丢弃它们）。
- `input_format_import_nested_json` 允许将嵌套 JSON 对象插入到 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 类型的列中。

:::note
设置作为 `GET` 参数为 HTTP 接口指定，或作为以 `--` 为前缀的额外命令行参数为 `CLI` 接口指定。
:::
