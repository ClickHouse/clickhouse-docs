---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '시작값부터 종료값까지(종료값 포함)의 정수를 담은 하나의 `generate_series` 컬럼(UInt64)만 포함하는 테이블을 반환합니다.'
doc_type: 'reference'
---

# generate_series 테이블 함수(Table Function) \{#generate_series-table-function\}

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

## 예시 \{#examples\}

다음 쿼리는 동일한 데이터를 가지되 컬럼 이름만 다른 테이블을 반환합니다:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

그리고 다음 쿼리는 동일한 내용을 가지지만 컬럼 이름이 다른 테이블을 반환합니다(두 번째 옵션이 더 효율적입니다):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
