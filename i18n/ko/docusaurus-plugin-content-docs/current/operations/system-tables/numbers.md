---
description: 'UInt64 타입의 `number` 컬럼 하나를 가진 시스템 테이블로, 0부터 시작하는 거의 모든 자연수를 포함합니다.'
keywords: ['system table', 'numbers']
slug: /operations/system-tables/numbers
title: 'system.numbers'
doc_type: 'reference'
---

# system.numbers \{#systemnumbers\}

이 테이블에는 `number`라는 이름의 UInt64 단일 컬럼이 있으며, 0부터 시작하는 거의 모든 자연수를 포함합니다.

이 테이블은 테스트용으로 사용하거나 무차별 대입(brute force) 검색이 필요할 때 사용할 수 있습니다.

이 테이블에 대한 읽기 작업은 병렬화되지 않습니다.

**예시**

```sql
SELECT * FROM system.numbers LIMIT 10;
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

조건을 사용하여 출력 결과를 제한할 수도 있습니다.

```sql
SELECT * FROM system.numbers WHERE number < 10;
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
