---
alias: []
description: 'Vertical 형식에 대한 문서'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: 'Vertical'
doc_type: 'reference'
---

| Input | Output | 별칭 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 설명 \{#description\}

각 값을 컬럼 이름과 함께 별도의 줄에 출력합니다. 이 형식은 각 행이 많은 수의 컬럼으로 이루어져 있을 때 한두 행만 출력하기에 편리합니다.

[`NULL`](/sql-reference/syntax.md)은 문자열 값 `NULL`과 값이 없는 경우(no value)를 쉽게 구분할 수 있도록 `ᴺᵁᴸᴸ`로 출력됩니다. JSON 컬럼은 Pretty 형식으로 출력되며, `NULL` 값은 유효한 JSON 값이고 `"null"`과도 쉽게 구분되므로 `null`로 출력됩니다.



## 사용 예시 \{#example-usage\}

예시:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

Vertical 형식에서는 행에 이스케이프가 적용되지 않습니다:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

이 형식은 쿼리 결과를 출력하는 데만 적합하며, 파싱(테이블에 삽입할 데이터를 가져오는 작업)에는 적합하지 않습니다.


## 형식 설정 \{#format-settings\}
