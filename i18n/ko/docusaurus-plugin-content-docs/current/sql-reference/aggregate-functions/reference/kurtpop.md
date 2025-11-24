---
'description': '시퀀스의 첨도를 계산합니다.'
'sidebar_position': 157
'slug': '/sql-reference/aggregate-functions/reference/kurtpop'
'title': 'kurtPop'
'doc_type': 'reference'
---


# kurtPop

시퀀스의 [첨도](https://en.wikipedia.org/wiki/Kurtosis)를 계산합니다.

```sql
kurtPop(expr)
```

**인수**

`expr` — 숫자를 반환하는 [표현식](/sql-reference/syntax#expressions).

**반환 값**

주어진 분포의 첨도. 타입 — [Float64](../../../sql-reference/data-types/float.md)

**예제**

```sql
SELECT kurtPop(value) FROM series_with_value_column;
```
