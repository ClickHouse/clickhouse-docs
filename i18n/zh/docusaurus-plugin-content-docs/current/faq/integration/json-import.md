---
slug: /faq/integration/json-import
title: '如何将 JSON 导入 ClickHouse？'
toc_hidden: true
toc_priority: 11
description: '本页将向您展示如何将 JSON 导入 ClickHouse'
keywords: ['JSON 导入', 'JSONEachRow 格式', '数据导入', 'JSON 摄取', '数据格式']
doc_type: 'guide'
---

# 如何将 JSON 导入 ClickHouse？ {#how-to-import-json-into-clickhouse}

ClickHouse 支持多种[输入和输出数据格式](/interfaces/formats)。其中包含多种 JSON 变体，但在数据摄取场景中最常用的是 [JSONEachRow](/interfaces/formats/JSONEachRow)。它要求每行一个 JSON 对象，各对象之间以换行符分隔。

## 示例 {#examples}

使用 [HTTP 接口](../../interfaces/http.md)：

```

Using [CLI interface](../../interfaces/cli.md):

```

使用[CLI 界面](../../interfaces/cli.md)：

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

与其手动插入数据，你可以考虑改用[集成工具](../../integrations/index.mdx)。

## 实用设置 {#useful-settings}

- `input_format_skip_unknown_fields` 允许即使 JSON 中包含表结构中不存在的额外字段也能插入数据（通过丢弃这些字段）。
- `input_format_import_nested_json` 允许将嵌套的 JSON 对象插入到 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 类型的列中。

:::note
设置可以作为 HTTP 接口的 `GET` 参数，或作为带有 `--` 前缀的额外命令行参数提供给 `CLI` 接口。
:::
