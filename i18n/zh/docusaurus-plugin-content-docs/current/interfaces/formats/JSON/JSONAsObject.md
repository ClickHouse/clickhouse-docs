---
title: 'JSONAsObject'
slug: '/interfaces/formats/JSONAsObject'
keywords: ['JSONAsObject']
input_format: true
output_format: false
alias: []
---

## 描述 {#description}

在这种格式中，单个 JSON 对象被解释为单个 [JSON](/sql-reference/data-types/newjson.md) 值。如果输入有多个 JSON 对象（以逗号分隔），则被解释为单独的行。如果输入数据被方括号括起来，则被解释为 JSON 数组。

此格式只能针对具有单个 [JSON](/sql-reference/data-types/newjson.md) 类型字段的表进行解析。其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 或 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

```sql title="Query"
SET allow_experimental_json_type = 1;
CREATE TABLE json_as_object (json JSON) ENGINE = Memory;
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_object FORMAT JSONEachRow;
```

```response title="Response"
{"json":{"foo":{"bar":{"x":"y"},"baz":"1"}}}
{"json":{}}
{"json":{"any json stucture":"1"}}
```

### JSON 对象的数组 {#an-array-of-json-objects}

```sql title="Query"
SET allow_experimental_json_type = 1;
CREATE TABLE json_square_brackets (field JSON) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsObject [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];
SELECT * FROM json_square_brackets FORMAT JSONEachRow;
```

```response title="Response"
{"field":{"id":"1","name":"name1"}}
{"field":{"id":"2","name":"name2"}}
```

### 带有默认值的列 {#columns-with-default-values}

```sql title="Query"
SET allow_experimental_json_type = 1;
CREATE TABLE json_as_object (json JSON, time DateTime MATERIALIZED now()) ENGINE = Memory;
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"foo":{"bar":{"x":"y"},"baz":1}};
INSERT INTO json_as_object (json) FORMAT JSONAsObject {};
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"any json stucture":1}
SELECT time, json FROM json_as_object FORMAT JSONEachRow
```

```response title="Response"
{"time":"2024-09-16 12:18:10","json":{}}
{"time":"2024-09-16 12:18:13","json":{"any json stucture":"1"}}
{"time":"2024-09-16 12:18:08","json":{"foo":{"bar":{"x":"y"},"baz":"1"}}}
```

## 格式设置 {#format-settings}
