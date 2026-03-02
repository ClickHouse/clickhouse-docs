---
description: 'OFFSET에 대한 문서'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH 절'
doc_type: 'reference'
---

`OFFSET` 및 `FETCH`는 데이터를 여러 부분으로 나누어 조회할 수 있도록 합니다. 단일 쿼리로 가져올 행 블록을 지정합니다.

```sql
-- SQL Standard style:
[OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]

-- MySQL/PostgreSQL style:
[LIMIT [n, ]m] [OFFSET offset_row_count]
```

`offset_row_count` 또는 `fetch_row_count` 값은 숫자이거나 리터럴 상수일 수 있습니다. `fetch_row_count`는 생략할 수 있으며, 기본값은 1입니다.

`OFFSET`은 쿼리 결과 집합에서 행을 반환하기 시작하기 전에 건너뛸 행의 개수를 지정합니다. `OFFSET n`은 결과에서 처음 `n`개의 행을 건너뜁니다.

음수 OFFSET도 지원됩니다. `OFFSET -n`은 결과에서 마지막 `n`개의 행을 건너뜁니다.

분수 OFFSET도 지원됩니다. `OFFSET n` — 0 &lt; n &lt; 1이면 결과의 처음 n * 100%를 건너뜁니다.

예:
• `OFFSET 0.1` - 결과의 처음 10%를 건너뜁니다.

> **Note**
> • 분수는 1보다 작고 0보다 큰 [Float64](../../data-types/float.md) 타입의 숫자여야 합니다.
> • 계산 결과가 행 개수로서 분수가 되는 경우, 다음 정수로 올림됩니다.

`FETCH`는 쿼리 결과에 포함될 수 있는 행의 최대 개수를 지정합니다.

`ONLY` 옵션은 `OFFSET`에 의해 생략된 행들 바로 다음의 행들만 반환하는 데 사용됩니다. 이 경우 `FETCH`는 [LIMIT](../../../sql-reference/statements/select/limit.md) 절의 대안이 됩니다. 예를 들어, 다음 쿼리는

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

해당 쿼리와 동일합니다

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` 옵션은 `ORDER BY` 절에 따라 결과 집합에서 정렬 결과상 마지막 행과 값이 같은 추가 행들도 함께 반환하는 데 사용됩니다. 예를 들어 `fetch_row_count`가 5로 설정되어 있지만 두 개의 추가 행이 다섯 번째 행의 `ORDER BY` 컬럼 값과 일치하는 경우, 결과 집합에는 총 7개의 행이 포함됩니다.

:::note
표준에 따르면, `OFFSET` 절과 `FETCH` 절이 모두 존재하는 경우 `OFFSET` 절이 `FETCH` 절보다 먼저 와야 합니다.
:::

:::note
실제 오프셋은 [offset](../../../operations/settings/settings.md#offset) 설정값에 따라서도 달라질 수 있습니다.
:::

## 예제 \{#examples\}

입력 테이블:

```text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

`ONLY` 옵션 사용 방법:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

결과:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES` 옵션 사용 예시:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

결과:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
