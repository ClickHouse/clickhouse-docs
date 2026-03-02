---
description: '`system.numbers`와 유사한 시스템 테이블이지만 읽기가 병렬화되고
  숫자는 임의의 순서로 반환될 수 있습니다.'
keywords: ['system table', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
doc_type: 'reference'
---

[`system.numbers`](../../operations/system-tables/numbers.md)와 동일하지만 읽기가 병렬화됩니다. 숫자는 임의의 순서로 반환될 수 있습니다.

테스트용으로 사용됩니다.

**예시**

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
