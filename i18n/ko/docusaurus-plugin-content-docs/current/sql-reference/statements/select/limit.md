---
description: 'LIMIT 절에 대한 문서'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 절'
doc_type: 'reference'
---

# LIMIT 절 \{#limit-clause\}

`LIMIT` 절은 쿼리 결과에서 반환할 행의 개수를 제한합니다.

## 기본 구문 \{#basic-syntax\}

**처음 행 선택:**

```sql
LIMIT m
```

결과에서 처음 `m`개의 행을 반환하며, 행의 수가 `m`보다 적으면 모든 행을 반환합니다.

**대체 TOP 구문(MS SQL Server 호환):**

```sql
-- SELECT TOP number|percent column_name(s) FROM table_name
SELECT TOP 10 * FROM numbers(100);
SELECT TOP 0.1 * FROM numbers(100);
```

이는 `LIMIT m`과 동일하며 Microsoft SQL Server 쿼리와의 호환성을 위해 사용할 수 있습니다.

**오프셋을 사용하는 SELECT:**

```sql
LIMIT m OFFSET n
-- or equivalently:
LIMIT n, m
```

처음 `n`개의 행을 건너뛴 다음, 이어지는 `m`개의 행을 반환합니다.

두 경우 모두 `n`과 `m`은 음수가 아닌 정수여야 합니다.


## 음수 한계값 \{#negative-limits\}

음수 값을 사용하여 결과 집합의 *끝*에서부터 행을 선택합니다:

| 구문 | 결과 |
|--------|--------|
| `LIMIT -m` | 마지막 `m`개의 행 |
| `LIMIT -m OFFSET -n` | 마지막 `n`개의 행을 건너뛴 뒤의 마지막 `m`개의 행 |
| `LIMIT m OFFSET -n` | 마지막 `n`개의 행을 건너뛴 뒤의 처음 `m`개의 행 |
| `LIMIT -m OFFSET n` | 처음 `n`개의 행을 건너뛴 뒤의 마지막 `m`개의 행 |

`LIMIT -n, -m` 구문은 `LIMIT -m OFFSET -n`과 동일합니다.

## 분수형 LIMIT \{#fractional-limits\}

0과 1 사이의 소수 값을 사용하여 행의 백분율을 선택합니다:

| Syntax | Result |
|--------|--------|
| `LIMIT 0.1` | 처음 10%의 행 |
| `LIMIT 1 OFFSET 0.5` | 중앙값에 해당하는 행 |
| `LIMIT 0.25 OFFSET 0.5` | 제3 사분위수(처음 50%의 행을 건너뛴 후 선택되는 25%의 행) |

:::note

- 분수 값은 0보다 크고 1보다 작은 [Float64](../../data-types/float.md) 값이어야 합니다.
- 분수로 계산된 행 수는 다음 정수로 올림됩니다.
:::

## 여러 LIMIT 유형 결합하기 \{#combining-limit-types\}

표준 정수형 값과 분수 또는 음수 오프셋을 함께 사용할 수 있습니다:

```sql
LIMIT 10 OFFSET 0.5    -- 10 rows starting from the halfway point
LIMIT 10 OFFSET -20    -- 10 rows after skipping the last 20
```


## LIMIT ... WITH TIES \{#limit--with-ties-modifier\}

`WITH TIES` 수정자는 LIMIT 절에서 선택된 마지막 행과 동일한 `ORDER BY` 값을 가진 추가 행을 포함합니다.

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

`WITH TIES`를 사용하면 마지막 값과 동일한 모든 행이 결과에 포함됩니다:

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

6번 행은 5번 행과 같은 값(`2`)을 가지고 있기 때문에 포함됩니다.

:::note
`WITH TIES`는 음수 LIMIT 값과 함께 사용할 수 없습니다.
:::

이 수정자는 [`ORDER BY ... WITH FILL`](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 수정자와 함께 사용할 수 있습니다.


## 고려 사항 \{#considerations\}

**비결정적 결과:** [`ORDER BY`](../../../sql-reference/statements/select/order-by.md) 절이 없으면 반환되는 행이 임의로 선택되며, 쿼리를 실행할 때마다 달라질 수 있습니다.

**서버 측 제한:** 반환되는 행의 수는 [limit](../../../operations/settings/settings.md#limit) 설정에 따라서도 달라질 수 있습니다.

## 같이 보기 \{#see-also\}

- [LIMIT BY](/sql-reference/statements/select/limit-by) — 값 그룹별 행 수를 제한하여 각 카테고리에서 상위 N개의 결과를 조회하는 데 유용합니다.