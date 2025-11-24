---
'description': '일련의 skewness를 계산합니다.'
'sidebar_position': 185
'slug': '/sql-reference/aggregate-functions/reference/skewpop'
'title': 'skewPop'
'doc_type': 'reference'
---


# skewPop

주어진 수열의 [비대칭도](https://en.wikipedia.org/wiki/Skewness)를 계산합니다.

```sql
skewPop(expr)
```

**인수**

`expr` — 숫자를 반환하는 [표현식](/sql-reference/syntax#expressions).

**반환 값**

주어진 분포의 비대칭도. 유형 — [Float64](../../../sql-reference/data-types/float.md)

**예제**

```sql
SELECT skewPop(value) FROM series_with_value_column;
```
