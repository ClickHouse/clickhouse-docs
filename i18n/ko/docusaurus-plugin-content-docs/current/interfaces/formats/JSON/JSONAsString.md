---
alias: []
description: 'JSONAsString 형식에 대한 문서'
input_format: true
keywords: ['JSONAsString']
output_format: false
slug: /interfaces/formats/JSONAsString
title: 'JSONAsString'
doc_type: 'reference'
---

| 입력 | 출력  | 별칭 |
|-------|---------|-------|
| ✔     | ✗       |       |

## 설명 \{#description\}

이 형식에서는 단일 JSON 객체가 하나의 값으로 해석됩니다.  
입력에 여러 JSON 객체(쉼표로 구분됨)가 포함되어 있으면 각 객체는 별도의 행으로 해석됩니다.  
입력 데이터가 대괄호로 둘러싸여 있으면 JSON 객체 배열로 해석됩니다.

:::note
이 형식은 [String](/sql-reference/data-types/string.md) 타입의 단일 필드를 가진 테이블에 대해서만 파싱할 수 있습니다.  
나머지 컬럼은 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 또는 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)로 설정하거나,  
생략해야 합니다.  
:::

전체 JSON 객체를 String으로 직렬화한 후 [JSON functions](/sql-reference/functions/json-functions.md)을 사용하여 처리할 수 있습니다.

## 사용 예 \{#example-usage\}

### 기본 예제 \{#basic-example\}

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


### JSON 객체의 배열 \{#an-array-of-json-objects\}

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


## 형식 설정 \{#format-settings\}