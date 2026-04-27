---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '시작값부터 종료값까지(종료값 포함)의 정수를 담은 하나의 `generate_series` 컬럼(UInt64)만 포함하는 테이블을 반환합니다.'
doc_type: 'reference'
---

# generate_series 테이블 함수 \{#generate_series-table-function\}

별칭: `generateSeries`

## 구문 \{#syntax\}

단일 &#39;generate&#95;series&#39; 컬럼(`UInt64`)을 가진 테이블을 반환하며, 이 컬럼에는 start부터 stop까지의 정수가 양 끝값을 포함하여 저장됩니다:

```sql
generate_series(START, STOP)
```

단일 &#39;generate&#95;series&#39; 컬럼(`UInt64`)을 가진 테이블을 반환하며, 이 컬럼에는 start부터 stop까지(양 끝값 포함) `STEP`으로 지정된 값 사이 간격으로 증가하는 정수가 포함됩니다:

```sql
generate_series(START, STOP, STEP)
```

`STEP`은 음수일 수 있으며, 이 경우 시리즈는 `START`에서 `STOP`까지 내림차순으로 생성됩니다. `STEP`이 음수이고 `START < STOP`이면 결과는 빈 상태입니다.

## 예시 \{#examples\}

다음 쿼리는 동일한 데이터를 가지되 컬럼 이름만 다른 테이블을 반환합니다:

```sql
SELECT * FROM numbers(10, 5);
```

```response
┌─number─┐
│     10 │
│     11 │
│     12 │
│     13 │
│     14 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 14);
```

```response
┌─generate_series─┐
│              10 │
│              11 │
│              12 │
│              13 │
│              14 │
└─────────────────┘
```

그리고 다음 쿼리는 동일한 내용을 가지지만 컬럼 이름이 다른 테이블을 반환합니다(두 번째 옵션이 더 효율적입니다):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
```

```response
┌─number─┐
│     10 │
│     13 │
│     16 │
│     19 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 20, 3);
```

```response
┌─generate_series─┐
│              10 │
│              13 │
│              16 │
│              19 │
└─────────────────┘
```

내림차순 수열을 생성합니다:

```sql
SELECT * FROM generate_series(9, 0, -1);
```

```response
┌─generate_series─┐
│               9 │
│               8 │
│               7 │
│               6 │
│               5 │
│               4 │
│               3 │
│               2 │
│               1 │
│               0 │
└─────────────────┘
```