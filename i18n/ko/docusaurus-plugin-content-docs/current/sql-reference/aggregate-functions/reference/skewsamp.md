---
'description': '시퀀스의 샘플 왜곡을 계산합니다.'
'sidebar_position': 186
'slug': '/sql-reference/aggregate-functions/reference/skewsamp'
'title': 'skewSamp'
'doc_type': 'reference'
---


# skewSamp

확률 변수의 [샘플 왜도](https://en.wikipedia.org/wiki/Skewness)를 계산합니다.

값이 난수의 샘플을 형성하는 경우, 이는 난수 변수의 왜도의 편향되지 않은 추정치를 나타냅니다.

```sql
skewSamp(expr)
```

**인수**

`expr` — 숫자를 반환하는 [식](/sql-reference/syntax#expressions).

**반환 값**

주어진 분포의 왜도. 유형 — [Float64](../../../sql-reference/data-types/float.md). 만약 `n <= 1`(`n`은 샘플의 크기)인 경우, 함수는 `nan`을 반환합니다.

**예제**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
