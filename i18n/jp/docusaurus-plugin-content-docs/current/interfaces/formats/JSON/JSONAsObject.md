---
'alias': []
'description': 'JSONAsObject フォーマットのドキュメント'
'input_format': true
'keywords':
- 'JSONAsObject'
'output_format': false
'slug': '/interfaces/formats/JSONAsObject'
'title': 'JSONAsObject'
'doc_type': 'reference'
---

## 説明 {#description}

このフォーマットでは、単一の JSON オブジェクトが単一の [JSON](/sql-reference/data-types/newjson.md) 値として解釈されます。入力に複数の JSON オブジェクト（コンマで区切られた場合）がある場合、それらは別々の行として解釈されます。入力データが角括弧で囲まれている場合、それは JSON の配列として解釈されます。

このフォーマットは、単一の [JSON](/sql-reference/data-types/newjson.md) 型のフィールドを持つテーブルのみで解析できます。残りのカラムは [`DEFAULT`](/sql-reference/statements/create/table.md/#default) または [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) に設定する必要があります。

## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

```sql title="Query"
CREATE TABLE json_as_object (json JSON) ENGINE = Memory;
INSERT INTO json_as_object (json) FORMAT JSONAsObject {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_object FORMAT JSONEachRow;
```

```response title="Response"
{"json":{"foo":{"bar":{"x":"y"},"baz":"1"}}}
{"json":{}}
{"json":{"any json stucture":"1"}}
```

### JSON オブジェクトの配列 {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field JSON) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsObject [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];
SELECT * FROM json_square_brackets FORMAT JSONEachRow;
```

```response title="Response"
{"field":{"id":"1","name":"name1"}}
{"field":{"id":"2","name":"name2"}}
```

### デフォルト値を持つカラム {#columns-with-default-values}

```sql title="Query"
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

## フォーマット設定 {#format-settings}
