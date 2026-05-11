---
description: 'CoalescingMergeTree는 MergeTree 엔진을 상속한 엔진입니다. 핵심 기능은
  파트 병합 시 각 컬럼의 마지막 NULL이 아닌 값을 자동으로 저장하는 것입니다.'
sidebar_label: 'CoalescingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/coalescingmergetree
title: 'CoalescingMergeTree 테이블 엔진'
keywords: ['CoalescingMergeTree']
show_related_blogs: true
doc_type: 'reference'
---

# CoalescingMergeTree 테이블 엔진 \{#coalescingmergetree-table-engine\}

:::note Available from version 25.6
이 테이블 엔진은 OSS와 Cloud 모두에서 버전 25.6 이상부터 사용할 수 있습니다.
:::

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/mergetree)를 기반으로 합니다. 핵심 차이점은 데이터 파트가 병합되는 방식에 있습니다. `CoalescingMergeTree` 테이블에서는 ClickHouse가 동일한 기본 키(더 정확히는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md))를 가진 모든 행을 하나의 행으로 대체하며, 이 행에는 각 컬럼에 대해 가장 최신의 NULL이 아닌 값이 저장됩니다.

이를 통해 컬럼 단위 업서트(upsert)가 가능해지므로, 전체 행이 아니라 특정 컬럼만 업데이트할 수 있습니다.

`CoalescingMergeTree`는 키가 아닌 컬럼에서 널 허용 타입과 함께 사용하도록 설계되었습니다. 컬럼이 널 허용이 아니면 동작은 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)와 동일합니다.

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = CoalescingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

요청 매개변수에 대한 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.


### CoalescingMergeTree 매개변수 \{#parameters-of-coalescingmergetree\}

#### 컬럼 \{#columns\}

`columns` - 선택 사항입니다. 값을 병합할 컬럼 이름들의 튜플입니다. 지정된 컬럼은 파티션 키나 정렬 키에 포함되면 안 됩니다. `columns`가 지정되지 않으면 ClickHouse는 정렬 키에 포함되지 않은 모든 컬럼의 값을 병합합니다.

### 쿼리 절 \{#query-clauses\}

`CoalescingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>사용이 중단된 테이블 생성 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 말고, 가능하다면 기존 프로젝트도 위에서 설명한 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`를 제외한 모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.

- `columns` — 합산할 컬럼들의 이름을 포함하는 튜플입니다. 선택적 매개변수입니다. 설명은 위의 본문을 참조하십시오.

</details>

## 사용 예시 \{#usage-example\}

다음과 같은 테이블이 있다고 가정합니다.

```sql
CREATE TABLE test_table
(
    key UInt64,
    value_int Nullable(UInt32),
    value_string Nullable(String),
    value_date Nullable(Date)
)
ENGINE = CoalescingMergeTree()
ORDER BY key
```

데이터를 삽입합니다:

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

결과는 다음과 같습니다:

```sql
SELECT * FROM test_table ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   1 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-01-01 │
│   2 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-02-01 │
│   2 │        10 │ test         │       ᴺᵁᴸᴸ │
└─────┴───────────┴──────────────┴────────────┘
```

정확한 최종 결과를 위한 권장 쿼리:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

`FINAL` 수정자를 사용하면 ClickHouse가 쿼리 시점에 머지 로직을 적용하여 각 컬럼에 대해 올바르게 병합된 「최신」 값을 반환합니다. 이는 CoalescingMergeTree 테이블에서 쿼리할 때 가장 안전하고 정확한 방법입니다.

:::note

`GROUP BY`를 사용하는 방식은 기반이 되는 파트가 아직 완전히 병합되지 않은 경우 잘못된 결과를 반환할 수 있습니다.

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Not recommended.
```

:::
