---
'alias': []
'description': 'Vertical 형식에 대한 Documentation'
'input_format': false
'keywords':
- 'Vertical'
'output_format': true
'slug': '/interfaces/formats/Vertical'
'title': 'Vertical'
'doc_type': 'reference'
---

| 입력  | 출력  | 별칭  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

각 값을 해당 컬럼 이름과 함께 별도의 줄에 출력합니다. 이 형식은 각 행이 많은 컬럼으로 구성되어 있을 경우 하나 또는 몇 개의 행만 출력하는 데 편리합니다.

[`NULL`](/sql-reference/syntax.md)은 문자열 값 `NULL`과 값이 없음을 구분하기 쉽게 하기 위해 `ᴺᵁᴸᴸ`로 출력됩니다. JSON 컬럼은 예쁘게 출력되며, `NULL`은 유효한 JSON 값으로 `"null"`과 쉽게 구분할 수 있기 때문에 `null`로 출력됩니다.

## 예제 사용법 {#example-usage}

예제:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

세로 형식에서 행은 이스케이프되지 않습니다:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

이 형식은 쿼리 결과를 출력하는 데만 적합하며, 테이블에 삽입할 데이터를 가져오는 데는 적합하지 않습니다.

## 형식 설정 {#format-settings}
