---
'description': '컬럼의 값을 위한 Shannon entropy를 계산합니다.'
'sidebar_position': 131
'slug': '/sql-reference/aggregate-functions/reference/entropy'
'title': 'entropy'
'doc_type': 'reference'
---


# 엔트로피

값의 컬럼에 대해 [샤논 엔트로피](https://en.wikipedia.org/wiki/Entropy_(information_theory))를 계산합니다.

**구문**

```sql
entropy(val)
```

**인수**

- `val` — 모든 유형의 값의 컬럼입니다.

**반환 값**

- 샤논 엔트로피.

유형: [Float64](../../../sql-reference/data-types/float.md).

**예제**

쿼리:

```sql
CREATE TABLE entropy (`vals` UInt32,`strings` String) ENGINE = Memory;

INSERT INTO entropy VALUES (1, 'A'), (1, 'A'), (1,'A'), (1,'A'), (2,'B'), (2,'B'), (2,'C'), (2,'D');

SELECT entropy(vals), entropy(strings) FROM entropy;
```

결과:

```text
┌─entropy(vals)─┬─entropy(strings)─┐
│             1 │             1.75 │
└───────────────┴──────────────────┘
```
