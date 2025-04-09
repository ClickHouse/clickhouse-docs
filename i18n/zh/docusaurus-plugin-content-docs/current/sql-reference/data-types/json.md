---
slug: /sql-reference/data-types/object-data-type
sidebar_position: 26
sidebar_label: 对象数据类型
keywords: ['object', 'data type']
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 对象数据类型 

<DeprecatedBadge/>

**此功能尚未为生产环境准备好，并已被弃用。** 如果您需要处理 JSON 文档，请考虑使用 [本指南](/integrations/data-formats/json/overview)。支持 JSON 对象的新实现正在 Beta 阶段。更多详细信息 [在这里](/sql-reference/data-types/newjson)。

<hr />

在单个列中存储 JavaScript 对象表示法 (JSON) 文档。

当启用 [use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type) 时，`JSON` 可以作为 `Object('json')` 的别名。

## 示例 {#example}

**示例 1**

创建一个包含 `JSON` 列的表并向其中插入数据：

```sql
CREATE TABLE json
(
    o JSON
)
ENGINE = Memory
```

```sql
INSERT INTO json VALUES ('{"a": 1, "b": { "c": 2, "d": [1, 2, 3] }}')
```

```sql
SELECT o.a, o.b.c, o.b.d[3] FROM json
```

```text
┌─o.a─┬─o.b.c─┬─arrayElement(o.b.d, 3)─┐
│   1 │     2 │                      3 │
└─────┴───────┴────────────────────────┘
```

**示例 2**

为了能够创建一个有序的 `MergeTree` 家族表，必须将排序键提取到其列中。例如，插入一个以 JSON 格式压缩的 HTTP 访问日志文件：

```sql
CREATE TABLE logs
(
	timestamp DateTime,
	message JSON
)
ENGINE = MergeTree
ORDER BY timestamp
```

```sql
INSERT INTO logs
SELECT parseDateTimeBestEffort(JSONExtractString(json, 'timestamp')), json
FROM file('access.json.gz', JSONAsString)
```

## 显示 JSON 列 {#displaying-json-columns}

在显示 `JSON` 列时，ClickHouse 默认只显示字段值（因为在内部，它被表示为一个元组）。您还可以通过设置 `output_format_json_named_tuples_as_objects = 1` 来显示字段名称：

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## 相关内容 {#related-content}

- [在 ClickHouse 中使用 JSON](/integrations/data-formats/json/overview)
- [将数据导入 ClickHouse - 第 2 部分 - JSON 绕道](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
