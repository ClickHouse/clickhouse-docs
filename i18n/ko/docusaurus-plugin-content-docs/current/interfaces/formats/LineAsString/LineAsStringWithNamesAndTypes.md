---
alias: []
description: 'LineAsStringWithNamesAndTypes 형식에 대한 문서'
input_format: false
keywords: ['LineAsStringWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
title: 'LineAsStringWithNamesAndTypes'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 설명 \{#description\}

`LineAsStringWithNames` 형식은 [`LineAsString`](./LineAsString.md) 형식과 유사하지만, 두 개의 헤더 행을 출력합니다. 하나는 컬럼 이름을, 다른 하나는 타입을 나타냅니다.



## 사용 예제 \{#example-usage\}

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


## 형식 설정 \{#format-settings\}
