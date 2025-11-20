---
'description': '`system.numbers`와 유사한 시스템 테이블로, 읽기는 병렬화되며 숫자는 임의의 순서로 반환될 수 있습니다.'
'keywords':
- 'system table'
- 'numbers_mt'
'slug': '/operations/system-tables/numbers_mt'
'title': 'system.numbers_mt'
'doc_type': 'reference'
---

The same as [`system.numbers`](../../operations/system-tables/numbers.md) but reads are parallelized. The numbers can be returned in any order.

Used for tests.

**예제**

```sql
SELECT * FROM system.numbers_mt LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```
