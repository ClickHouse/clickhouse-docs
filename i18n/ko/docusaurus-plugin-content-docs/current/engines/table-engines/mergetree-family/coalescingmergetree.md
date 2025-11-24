---
'description': 'CoalescingMergeTree는 MergeTree 엔진에서 상속됩니다. 이의 주요 기능은 파트 병합 동안 각 컬럼의
  마지막 비어 있지 않은 값 자동 저장 능력입니다.'
'sidebar_label': 'CoalescingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/coalescingmergetree'
'title': 'CoalescingMergeTree 테이블 엔진'
'keywords':
- 'CoalescingMergeTree'
'show_related_blogs': true
'doc_type': 'reference'
---


# CoalescingMergeTree 테이블 엔진

:::note 버전 25.6에서 사용 가능
이 테이블 엔진은 버전 25.6 이상에서 OSS 및 Cloud 모두에서 사용 가능합니다.
:::

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/mergetree)에서 상속됩니다. 주요 차이점은 데이터 파트를 병합하는 방식입니다: `CoalescingMergeTree` 테이블의 경우, ClickHouse는 동일한 기본 키(혹은 더 정확히는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md))를 가진 모든 행을 각 컬럼에 대한 최신 비-NULL 값이 포함된 단일 행으로 대체합니다.

이는 컬럼 수준에서의 upsert를 가능하게 하여, 전체 행이 아닌 특정 컬럼만 업데이트할 수 있습니다.

`CoalescingMergeTree`는 비기본 컬럼에서 Nullable 타입과 함께 사용하기 위해 설계되었습니다. 컬럼이 Nullable이 아닌 경우, 동작은 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)와 동일합니다.

## 테이블 생성하기 {#creating-a-table}

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

요청 파라미터에 대한 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.

### CoalescingMergeTree의 파라미터 {#parameters-of-coalescingmergetree}

#### 컬럼 {#columns}

`columns` - 값이 통합될 컬럼의 이름을 가진 튜플. 선택적 파라미터입니다.
    컬럼은 숫자형이어야 하며 파티션 또는 정렬 키에 포함되어서는 안 됩니다.

 `columns`가 지정되지 않은 경우, ClickHouse는 정렬 키에 포함되지 않은 모든 컬럼에서 값을 통합합니다.

### 쿼리 절 {#query-clauses}

`CoalescingMergeTree` 테이블을 생성할 때 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블 생성을 위한 더 이상 사용되지 않는 방법</summary>

:::note
새로운 프로젝트에서는 이 방법을 사용하지 마시고, 가능하다면 이전 프로젝트를 위에서 설명한 방법으로 전환하시기 바랍니다.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`를 제외한 모든 파라미터는 `MergeTree`와 동일한 의미를 가집니다.

- `columns` — 값이 합산될 컬럼의 이름을 가진 튜플. 선택적 파라미터입니다. 설명은 위의 텍스트를 참조하십시오.

</details>

## 사용 예시 {#usage-example}

다음 테이블을 고려해 보십시오:

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

결과는 다음과 같이 나타납니다:

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

정확하고 최종적인 결과를 위한 추천 쿼리:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

`FINAL` 수식어를 사용하면 ClickHouse가 쿼리 시간에 병합 논리를 적용하므로 각 컬럼에 대한 올바른 통합된 "최신" 값을 얻을 수 있습니다. 이는 CoalescingMergeTree 테이블에서 쿼리할 때 가장 안전하고 정확한 방법입니다.

:::note

`GROUP BY`와 함께 사용할 경우, 기본 파트가 완전히 병합되지 않았다면 잘못된 결과가 반환될 수 있습니다.

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Not recommended.
```

:::
