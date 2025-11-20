---
'alias': []
'description': 'LineAsStringWithNames 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'LineAsStringWithNames'
'output_format': true
'slug': '/interfaces/formats/LineAsStringWithNames'
'title': 'LineAsStringWithNames'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

`LineAsStringWithNames` 형식은 [`LineAsString`](./LineAsString.md) 형식과 유사하지만 컬럼 이름이 있는 헤더 행을 출력합니다.

## 예제 사용법 {#example-usage}

```sql title="Query"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="Response"
name    value
John    30
Jane    25
Peter    35
```

## 형식 설정 {#format-settings}
