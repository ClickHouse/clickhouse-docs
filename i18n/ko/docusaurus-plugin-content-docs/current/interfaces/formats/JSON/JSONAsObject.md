---
'alias': []
'description': 'JSONAsObject 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'JSONAsObject'
'output_format': false
'slug': '/interfaces/formats/JSONAsObject'
'title': 'JSONAsObject'
'doc_type': 'reference'
---

## 설명 {#description}

이 형식에서는 단일 JSON 객체가 단일 [JSON](/sql-reference/data-types/newjson.md) 값으로 해석됩니다. 입력에 여러 JSON 객체(쉼표로 구분됨)가 포함된 경우, 이들은 별도의 행으로 해석됩니다. 입력 데이터가 대괄호로 묶여 있으면, 이는 JSON 배열로 해석됩니다.

이 형식은 [JSON](/sql-reference/data-types/newjson.md)형식의 단일 필드가 있는 테이블에 대해서만 구문 분석할 수 있습니다. 나머지 컬럼은 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 또는 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)로 설정해야 합니다.

## 사용 예시 {#example-usage}

### 기본 예시 {#basic-example}

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

### JSON 객체 배열 {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field JSON) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsObject [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];
SELECT * FROM json_square_brackets FORMAT JSONEachRow;
```

```response title="Response"
{"field":{"id":"1","name":"name1"}}
{"field":{"id":"2","name":"name2"}}
```

### 기본값이 설정된 컬럼 {#columns-with-default-values}

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

## 형식 설정 {#format-settings}
