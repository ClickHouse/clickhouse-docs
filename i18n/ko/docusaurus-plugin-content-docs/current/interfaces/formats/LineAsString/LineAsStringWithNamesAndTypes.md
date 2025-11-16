---
'alias': []
'description': 'LineAsStringWithNamesAndTypes 형식에 대한 문서'
'input_format': false
'keywords':
- 'LineAsStringWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/LineAsStringWithNamesAndTypes'
'title': 'LineAsStringWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Description {#description}

`LineAsStringWithNames` 형식은 [`LineAsString`](./LineAsString.md) 형식과 유사하지만 두 개의 헤더 행을 출력합니다: 하나는 컬럼 이름으로, 다른 하나는 유형으로 구성됩니다.

## Example usage {#example-usage}

```sql
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNamesAndTypes;
```

```response title="Response"
name    value
String    Int32
John    30
Jane    25
Peter    35
```

## Format settings {#format-settings}
