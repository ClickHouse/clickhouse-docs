---
slug: /sql-reference/table-functions/primes
sidebar_position: 145
sidebar_label: 'primes'
title: 'primes'
description: '소수(prime number)를 담고 있는 단일 `prime` 컬럼을 가진 테이블을 반환합니다.'
doc_type: 'reference'
---

# primes Table Function \{#primes-table-function\}

* `primes()` – 2부터 시작하여 오름차순의 소수를 포함하는 단일 `prime` 컬럼(UInt64)을 가진 무한 테이블을 반환합니다. `LIMIT`(및 필요하다면 `OFFSET`)을 사용하여 행 수를 제한합니다.

* `primes(N)` – 2부터 시작하여 처음 `N`개의 소수를 포함하는 단일 `prime` 컬럼(UInt64)을 가진 테이블을 반환합니다.

* `primes(N, M)` – `N`번째 소수(0부터 시작하는 인덱스)부터 시작하여 `M`개의 소수를 포함하는 단일 `prime` 컬럼(UInt64)을 가진 테이블을 반환합니다.

* `primes(N, M, S)` – `N`번째 소수(0부터 시작하는 인덱스)부터 시작하여 소수 인덱스를 `S` 간격으로 증가시키면서 `M`개의 소수를 포함하는 단일 `prime` 컬럼(UInt64)을 가진 테이블을 반환합니다. 반환되는 소수는 인덱스 `N, N + S, N + 2S, ..., N + (M - 1)S`에 해당합니다. `S`는 반드시 `>= 1`이어야 합니다.

이는 [`system.primes`](/operations/system-tables/primes) 시스템 테이블과 유사합니다.

다음 쿼리는 서로 동일합니다:

```sql
SELECT * FROM primes(10);
SELECT * FROM primes(0, 10);
SELECT * FROM primes() LIMIT 10;
SELECT * FROM system.primes LIMIT 10;
SELECT * FROM system.primes WHERE prime IN (2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
```

다음 쿼리들도 서로 동일한 결과를 반환합니다:

```sql
SELECT * FROM primes(10, 10);
SELECT * FROM primes() LIMIT 10 OFFSET 10;
SELECT * FROM system.primes LIMIT 10 OFFSET 10;
```

### 예시 \{#examples\}

처음 10개의 소수:

```sql
SELECT * FROM primes(10);
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
SELECT prime FROM primes() WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```

아주 큰 범위의 소수에 대해 모듈러 CONSTRAINT를 만족하는 값을 구합니다. `p >= 10^15`를 만족하는 소수 `p` 중 `p`를 `65537`로 나눈 나머지가 `1`이 되는 첫 번째 값을 찾습니다.

```sql
SELECT prime
FROM primes()
WHERE prime >= toUInt64(1e15)
  AND prime % 65537 = 1
LIMIT 1;
```

```response
 ┌────────────prime─┐
 │ 1000000001218399 │ -- 1.00 quadrillion
 └──────────────────┘
```

처음 7개의 메르센 소수.

```sql
SELECT prime
FROM primes()
WHERE bitAnd(prime, prime + 1) = 0
LIMIT 7;
```

```response
  ┌──prime─┐
  │      3 │
  │      7 │
  │     31 │
  │    127 │
  │   8191 │
  │ 131071 │
  │ 524287 │
  └────────┘
```

### 참고 사항 \{#notes\}

* 가장 빠른 형태는 기본 step(`1`)을 사용하는 단순 범위 쿼리와 포인트 필터 쿼리입니다. 예를 들어 `primes(N)` 또는 `primes() LIMIT N`과 같습니다. 이러한 형태는 최적화된 소수 생성기를 사용하여 매우 큰 소수를 효율적으로 계산합니다.
* 비한정 소스(`primes()` / `system.primes`)의 경우, `prime BETWEEN ...`, `prime IN (...)`, `prime = ...`와 같은 단순 값 필터를 생성 과정에 적용하여 검색할 값의 범위를 제한할 수 있습니다. 예를 들어, 다음 쿼리는 거의 즉시 실행됩니다.

```sql
SELECT sum(prime)
FROM primes()
WHERE prime BETWEEN toUInt64(1e6) AND toUInt64(1e6) + 100
   OR prime BETWEEN toUInt64(1e12) AND toUInt64(1e12) + 100
   OR prime BETWEEN toUInt64(1e15) AND toUInt64(1e15) + 100
   OR prime IN (9999999967, 9999999971, 9999999973)
   OR prime = 1000000000000037;
```

```response
  ┌───────sum(prime)─┐
  │ 2004010006000641 │ -- 2.00 quadrillion
  └──────────────────┘

1 row in set. Elapsed: 0.090 sec. 
```

* 이 값 범위 최적화는 `WHERE`가 있는 범위가 제한된 테이블 함수(`primes(N)`, `primes(offset, count[, step])`)에는 적용되지 않습니다. 이러한 변형은 소수 인덱스로 유한한 테이블을 정의하므로, 의미를 보존하기 위해 해당 테이블을 생성한 이후에 필터를 평가해야 합니다.
* 0이 아닌 offset 및/또는 1보다 큰 step (`primes(offset, count)` / `primes(offset, count, step)`)을 사용하면 내부적으로 추가 소수를 더 생성한 뒤 건너뛰어야 할 수 있어 더 느려질 수 있습니다. offset이나 step이 필요하지 않다면 생략하십시오.
