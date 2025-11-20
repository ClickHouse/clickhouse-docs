---
'description': '일련의 샘플의 첨도를 계산합니다.'
'sidebar_position': 158
'slug': '/sql-reference/aggregate-functions/reference/kurtsamp'
'title': 'kurtSamp'
'doc_type': 'reference'
---


# kurtSamp

주어진 시퀀스의 [샘플 첨도](https://en.wikipedia.org/wiki/Kurtosis)를 계산합니다.

전달된 값이 샘플을 형성하는 경우, 이는 임의 변수의 첨도를 편향되지 않게 추정한 값을 나타냅니다.

```sql
kurtSamp(expr)
```

**인수**

`expr` — [표현식](/sql-reference/syntax#expressions)으로 숫자를 반환합니다.

**반환 값**

주어진 분포의 첨도. 타입 — [Float64](../../../sql-reference/data-types/float.md). 만약 `n <= 1` (`n`은 샘플의 크기)일 경우, 함수는 `nan`을 반환합니다.

**예시**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
