---
'description': 'ClickHouse 中已弃用的 Object 数据类型的文档'
'keywords':
- 'object'
- 'data type'
'sidebar_label': '对象数据类型'
'sidebar_position': 26
'slug': '/sql-reference/data-types/object-data-type'
'title': '对象数据类型'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Object Data Type 

<DeprecatedBadge/>

**此功能尚未准备好用于生产并已被弃用。** 如果您需要处理 JSON 文档，请考虑使用 [此指南](/integrations/data-formats/json/overview)。新的 JSON 对象支持实现正在测试中。更多详情请见 [此处](/sql-reference/data-types/newjson)。

<hr />

在单列中存储 JavaScript 对象表示法 (JSON) 文档。

`JSON` 可以在设置 [use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type) 时用作 `Object('json')` 的别名。

## 示例 {#example}

**示例 1**

创建一个带有 `JSON` 列的表并向其中插入数据：

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

为了能够创建有序的 `MergeTree` 家族表，必须将排序键提取到其列中。例如，要以 JSON 格式插入压缩的 HTTP 访问日志文件：

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

当显示 `JSON` 列时，ClickHouse 默认只显示字段值（因为在内部，它被表示为元组）。您还可以通过设置 `output_format_json_named_tuples_as_objects = 1` 来显示字段名称：

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## 相关内容 {#related-content}

- [在 ClickHouse 中使用 JSON](/integrations/data-formats/json/overview)
- [将数据导入 ClickHouse - 第 2 部分 - JSON 绕行](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
