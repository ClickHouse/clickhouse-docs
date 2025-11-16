---
'alias': []
'description': 'JSONAsString 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'JSONAsString'
'output_format': false
'slug': '/interfaces/formats/JSONAsString'
'title': 'JSONAsString'
'doc_type': 'reference'
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 설명 {#description}

이 형식에서는 단일 JSON 객체가 단일 값으로 해석됩니다. 
입력에 여러 JSON 객체가 포함되어 있는 경우(쉼표로 구분됨), 이들은 개별 행으로 해석됩니다. 
입력 데이터가 대괄호로 묶여 있는 경우, JSON 객체의 배열로 해석됩니다.

:::note
이 형식은 [String](/sql-reference/data-types/string.md) 타입의 단일 필드를 가진 테이블에 대해서만 구문 분석이 가능합니다. 
나머지 열은 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 또는 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)로 설정되거나 생략되어야 합니다.
:::

전체 JSON 객체를 문자열로 직렬화한 후, [JSON 함수](/sql-reference/functions/json-functions.md)를 사용하여 이를 처리할 수 있습니다.

## 예제 사용법 {#example-usage}

### 기본 예제 {#basic-example}

```sql title="Query"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="Response"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### JSON 객체의 배열 {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="Response"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## 형식 설정 {#format-settings}
