---
'description': 'MergeTree와 다르게 동일한 정렬 키 값 (`ORDER BY` 테이블 섹션, `PRIMARY KEY` 아님)을 가진
  중복 항목을 제거합니다.'
'sidebar_label': 'ReplacingMergeTree'
'sidebar_position': 40
'slug': '/engines/table-engines/mergetree-family/replacingmergetree'
'title': 'ReplacingMergeTree 테이블 엔진'
'doc_type': 'reference'
---


# ReplacingMergeTree 테이블 엔진

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)와 다르게 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md) 값이 있는 중복 항목을 제거합니다 (`ORDER BY` 테이블 섹션, `PRIMARY KEY` 아님).

데이터 중복 제거는 병합 시에만 발생합니다. 병합은 알려지지 않은 시간에 백그라운드에서 발생하므로 계획할 수 없습니다. 일부 데이터는 처리되지 않은 채로 남아 있을 수 있습니다. 비정기적인 병합을 `OPTIMIZE` 쿼리를 사용하여 실행할 수 있지만, `OPTIMIZE` 쿼리는 많은 양의 데이터를 읽고 쓰므로 이를 사용할 수 있다고 기대하지 마십시오.

따라서, `ReplacingMergeTree`는 중복 데이터를 백그라운드에서 제거하여 공간을 절약하는 데 적합하지만, 중복이 없음을 보장하지는 않습니다.

:::note
모범 사례 및 성능을 최적화하는 방법을 포함한 ReplacingMergeTree에 대한 자세한 가이드는 [여기](/guides/replacing-merge-tree)에서 확인할 수 있습니다.
:::

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = ReplacingMergeTree([ver [, is_deleted]])
[PARTITION BY expr]
[ORDER BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

요청 매개변수에 대한 설명은 [문장 설명](../../../sql-reference/statements/create/table.md)에서 확인하십시오.

:::note
행의 고유성은 `PRIMARY KEY`가 아닌 `ORDER BY` 테이블 섹션에 의해 결정됩니다.
:::

## ReplacingMergeTree 매개변수 {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — 버전 번호를 가진 컬럼. 타입 `UInt*`, `Date`, `DateTime` 또는 `DateTime64`. 선택적 매개변수입니다.

병합 시, `ReplacingMergeTree`는 동일한 정렬 키를 가진 모든 행 중 하나만 남깁니다:

- `ver`이 지정되지 않은 경우, 선택 항목에서 마지막 행입니다. 선택 항목은 병합에 참여하는 파트 집합에서의 행 집합입니다. 가장 최근에 생성된 파트(마지막 삽입)가 선택 항목에서 마지막이 됩니다. 따라서 중복 제거 후, 가장 최근 삽입된 각 고유 정렬 키에 대해 마지막 행만 남게 됩니다.
- `ver`이 지정된 경우에는 최대 버전을 가진 행입니다. 여러 행이 동일한 `ver`을 가진 경우, "ver이 지정되지 않은 경우" 규칙을 적용하여 가장 최근에 삽입된 행만 남습니다.

예시:

```sql
-- without ver - the last inserted 'wins'
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO myFirstReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO myFirstReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM myFirstReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ second  │ 2020-01-01 00:00:00 │
└─────┴─────────┴─────────────────────┘


-- with ver - the row with the biggest ver 'wins'
CREATE TABLE mySecondReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree(eventTime)
ORDER BY key;

INSERT INTO mySecondReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO mySecondReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM mySecondReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ first   │ 2020-01-01 01:01:01 │
└─────┴─────────┴─────────────────────┘
```

### `is_deleted` {#is_deleted}

`is_deleted` — 병합 중에 이 행의 데이터가 상태를 나타내는지 삭제될지를 결정하는 데 사용되는 컬럼의 이름; `1`은 "삭제된" 행, `0`은 "상태" 행입니다.

컬럼 데이터 타입 — `UInt8`.

:::note
`is_deleted`는 `ver`이 사용될 때만 활성화할 수 있습니다.

데이터에 대한 작업에 관계없이, 버전은 증가해야 합니다. 두 개의 삽입된 행이 동일한 버전 번호를 가진 경우, 마지막으로 삽입된 행이 유지됩니다.

기본적으로 ClickHouse는 삭제 행이더라도 키에 대해 마지막 행을 유지합니다. 이는 향후 낮은 버전의 행을 안전하게 삽입할 수 있도록 하기 위함이며, 삭제 행도 여전히 적용됩니다.

이러한 삭제 행을 영구적으로 제거하려면 테이블 설정 `allow_experimental_replacing_merge_with_cleanup`를 활성화하고 다음 중 하나를 수행하십시오:

1. 테이블 설정 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only` 및 `min_age_to_force_merge_seconds`를 설정합니다. 파티션의 모든 파트가 `min_age_to_force_merge_seconds`보다 오래된 경우, ClickHouse는 이를 모두 단일 파트로 병합하고 삭제 행을 제거합니다.

2. 수동으로 `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`을 실행합니다.
:::

예시:
```sql
-- with ver and is_deleted
CREATE OR REPLACE TABLE myThirdReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime,
    `is_deleted` UInt8
)
ENGINE = ReplacingMergeTree(eventTime, is_deleted)
ORDER BY key
SETTINGS allow_experimental_replacing_merge_with_cleanup = 1;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 0);
INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 1);

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- delete rows with is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## 쿼리 절 {#query-clauses}

`ReplacingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블 생성에 대한 더 이상 사용되지 않는 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 말고, 가능하면 이전 프로젝트를 위의 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`를 제외한 모든 매개변수는 `MergeTree`와 동일한 의미를 가집니다.

- `ver` - 버전이 있는 컬럼. 선택적 매개변수입니다. 설명은 위의 텍스트를 참조하십시오.

</details>

## 쿼리 시간 내 중복 제거 및 FINAL {#query-time-de-duplication--final}

병합 시, ReplacingMergeTree는 `ORDER BY` 컬럼의 값(테이블 생성에 사용됨)을 고유 식별자로 사용하여 중복 행을 식별하고 가장 높은 버전만 유지합니다. 그러나 이는 궁극적인 정확성만 제공하며, 행이 중복 제거된다는 보장은 없으므로 이를 의존해서는 안 됩니다. 따라서 쿼리는 업데이트 및 삭제 행이 쿼리에서 고려됨에 따라 잘못된 답변을 생성할 수 있습니다.

정확한 답변을 얻기 위해 사용자는 백그라운드 병합을 쿼리 시간 내 중복 제거 및 삭제 제거로 보완해야 합니다. 이는 `FINAL` 연산자를 사용하여 달성할 수 있습니다. 예를 들어 다음 예를 고려하십시오:

```sql
CREATE TABLE rmt_example
(
    `number` UInt16
)
ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

0 rows in set. Elapsed: 19.958 sec. Processed 1.00 billion rows, 8.00 GB (50.11 million rows/s., 400.84 MB/s.)
```
`FINAL` 없이 쿼리할 경우 잘못된 개수가 출력됩니다 (정확한 결과는 병합에 따라 다를 수 있습니다):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`을 추가하면 정확한 결과가 출력됩니다:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`에 대한 추가 세부정보 및 `FINAL` 성능을 최적화하는 방법에 대해서는 [ReplacingMergeTree에 대한 자세한 가이드](/guides/replacing-merge-tree)를 읽어보시기 바랍니다.
