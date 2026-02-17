---
description: '2부터 시작하여 오름차순으로 소수들을 포함하는 `prime`이라는 이름의 단일 UInt64 컬럼을 가진 system 테이블입니다.'
keywords: ['system 테이블', 'primes']
slug: /operations/system-tables/primes
title: 'system.primes'
doc_type: 'reference'
---

# system.primes \{#systemprimes\}

이 테이블에는 `prime`이라는 이름의 단일 UInt64 컬럼이 있으며, 2부터 시작하는 소수를 오름차순으로 포함합니다.

이 테이블은 테스트용으로 사용하거나, 소수에 대해 무차별 대입(브루트 포스) 검색을 해야 하는 경우에 사용할 수 있습니다.

이 테이블에서의 읽기 작업은 병렬화되지 않습니다.

이는 [`primes`](/sql-reference/table-functions/primes) 테이블 함수와 유사합니다.

또한 프레디케이트(조건식)로 출력 범위를 제한할 수도 있습니다.

**예시**

처음 10개의 소수.

```sql
SELECT * FROM system.primes LIMIT 10;
```

```response
  ┌─prime─┐
  │     2 │
  │     3 │
  │     5 │
  │     7 │
  │    11 │
  │    13 │
  │    17 │
  │    19 │
  │    23 │
  │    29 │
  └───────┘
```

1e15보다 큰 첫 번째 소수.

```sql
SELECT prime FROM system.primes WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```
