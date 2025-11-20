---
'alias': []
'description': 'LineAsString 형식에 대한 문서'
'input_format': true
'keywords':
- 'LineAsString'
'output_format': true
'slug': '/interfaces/formats/LineAsString'
'title': 'LineAsString'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`LineAsString` 형식은 입력 데이터의 각 행을 단일 문자열 값으로 해석합니다.  
이 형식은 [String](/sql-reference/data-types/string.md) 유형의 단일 필드를 가진 테이블에 대해서만 분석할 수 있습니다.  
나머지 컬럼은 [`DEFAULT`](/sql-reference/statements/create/table.md/#default), [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)로 설정하거나 생략해야 합니다.

## 사용 예제 {#example-usage}

```sql title="Query"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="Response"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## 형식 설정 {#format-settings}
