---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '정수 시퀀스를 포함하는 단일 `number` 컬럼으로 구성된 테이블을 반환합니다.'
doc_type: 'reference'
---

# numbers Table Function \{#numbers-table-function\}

* `numbers()` – 0부터 시작하는 오름차순 정수를 포함하는 단일 `number` 컬럼(UInt64)을 가진 무한 테이블을 반환합니다. `LIMIT`(및 선택적으로 `OFFSET`)을 사용하여 행 수를 제한합니다.

* `numbers(N)` – 0부터 `N - 1`까지의 정수를 포함하는 단일 `number` 컬럼(UInt64)을 가진 테이블을 반환합니다.

* `numbers(N, M)` – `N`부터 `N + M - 1`까지 `M`개의 정수를 포함하는 단일 `number` 컬럼(UInt64)을 가진 테이블을 반환합니다.

* `numbers(N, M, S)` – 간격 `S`로 `[N, N + M)` 구간의 값(대략 `M / S`개의 행, 올림)을 포함하는 단일 `number` 컬럼(UInt64)을 가진 테이블을 반환합니다. `S`는 반드시 `>= 1`이어야 합니다.

이는 [`system.numbers`](/operations/system-tables/numbers) 시스템 테이블과 유사합니다. 테스트 및 연속적인 값을 생성하는 데 사용할 수 있습니다.

다음 쿼리는 동일합니다:

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM numbers() LIMIT 10;
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

다음 쿼리들도 서로 동일한 쿼리입니다:

```sql
SELECT * FROM numbers(10, 10);
SELECT * FROM numbers() LIMIT 10 OFFSET 10;
SELECT * FROM system.numbers LIMIT 10 OFFSET 10;
```

다음 쿼리들도 서로 동등합니다:

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```


### 예제 \{#examples\}

처음 10개의 숫자.

```sql
SELECT * FROM numbers(10);
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
```

2010-01-01부터 2010-12-31까지의 날짜 시퀀스를 생성합니다.

```sql
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```

하위 20비트가 0이 되는 `sipHash64(number)` 값을 갖는 `UInt64` 중에서, `10^15` 이상인 첫 번째 값을 찾습니다.

```sql
SELECT number
FROM numbers()
WHERE number >= toUInt64(1e15)
  AND bitAnd(sipHash64(number), 0xFFFFF) = 0
LIMIT 1;
```

```response
 ┌───────────number─┐
 │ 1000000000056095 │ -- 1.00 quadrillion
 └──────────────────┘
```


### 참고 \{#notes\}

- 성능 측면에서 필요한 행의 개수를 알고 있는 경우, 무한 형태인 `numbers()` / `system.numbers`보다 유한 형태인 `numbers(N)`, `numbers(N, M[, S])` 사용을 권장합니다.
- 병렬로 생성하려면 `numbers_mt(...)` 또는 [`system.numbers_mt`](/operations/system-tables/numbers_mt) 테이블을 사용하십시오. 결과는 임의의 순서로 반환될 수 있습니다.