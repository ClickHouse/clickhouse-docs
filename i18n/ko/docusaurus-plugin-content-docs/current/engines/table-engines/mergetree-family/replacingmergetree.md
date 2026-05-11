---
description: '정렬 키 값이 같은(`ORDER BY` 테이블 섹션, `PRIMARY KEY` 아님) 중복 항목을 제거한다는 점에서 MergeTree와 다릅니다.'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree 테이블 엔진'
doc_type: 'reference'
---



# ReplacingMergeTree 테이블 엔진 \{#replacingmergetree-table-engine\}

이 엔진은 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md) 값(`ORDER BY` 테이블 섹션, `PRIMARY KEY` 아님)을 가진 중복 레코드를 제거한다는 점에서 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)와 다릅니다.

데이터 중복 제거는 머지(merge) 시점에만 발생합니다. 머지는 알 수 없는 시점에 백그라운드에서 수행되므로, 머지 시점을 기준으로 계획할 수 없습니다. 일부 데이터는 처리되지 않은 상태로 남을 수 있습니다. `OPTIMIZE` 쿼리를 사용해 예정되지 않은 머지를 실행할 수는 있지만, `OPTIMIZE` 쿼리가 대량의 데이터를 읽고 쓰게 되므로, 이를 전제로 설계하지 않는 것이 좋습니다.

따라서 `ReplacingMergeTree`는 공간 절약을 위해 백그라운드에서 중복 데이터를 정리하는 데에는 적합하지만, 중복이 전혀 없음을 보장하지는 않습니다.

:::note
모범 사례와 성능 최적화 방법을 포함한 ReplacingMergeTree에 대한 상세 가이드는 [여기](/guides/replacing-merge-tree)에서 확인할 수 있습니다.
:::



## 테이블 생성 \{#creating-a-table\}

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

요청 매개변수에 대한 설명은 [SQL 문 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.

:::note
행의 고유성은 `PRIMARY KEY`가 아니라 테이블의 `ORDER BY` 절에 의해 결정됩니다.
:::


## ReplacingMergeTree 매개변수 \{#replacingmergetree-parameters\}

### `ver` \{#ver\}

`ver` — 버전 번호를 저장하는 컬럼입니다. 타입은 `UInt*`, `Date`, `DateTime` 또는 `DateTime64`입니다. 선택적 매개변수입니다.

머지 시, `ReplacingMergeTree`는 정렬 키가 동일한 모든 행 중에서 하나만 남깁니다.

* `ver`가 설정되지 않은 경우: 선택(selection)에서 마지막 행이 남습니다. 선택(selection)은 머지에 참여하는 파트 집합 안의 행 집합입니다. 가장 최근에 생성된 파트(마지막 INSERT)가 선택에서 마지막이 됩니다. 따라서 중복 제거 이후에는 가장 최근 INSERT에서 각 고유 정렬 키마다 가장 마지막 행이 남습니다.
* `ver`가 지정된 경우: `ver`의 최대 버전을 가진 행이 남습니다. 여러 행의 `ver`가 동일하면, 해당 행들에 대해서는 「`ver`가 지정되지 않은 경우」 규칙을 사용합니다. 즉, 가장 최근에 INSERT된 행이 남습니다.

예:

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

### `is_deleted` \{#is_deleted\}

`is_deleted` — 머지 과정에서 이 행의 데이터가 상태를 나타내는지, 삭제되어야 하는지를 결정하는 데 사용되는 컬럼 이름입니다. `1`은 「삭제된」 행을, `0`은 「상태」 행을 의미합니다.

컬럼 데이터 타입 — `UInt8`입니다.

:::note
`is_deleted`는 `ver`가 사용되는 경우에만 활성화할 수 있습니다.

데이터에 어떤 연산이 수행되었는지와 관계없이 버전은 반드시 증가해야 합니다. 동일한 버전 번호를 가진 두 개의 행이 삽입되면, 마지막에 삽입된 행이 유지됩니다.

기본적으로 ClickHouse는 해당 행이 삭제 행이더라도 하나의 키에 대해 마지막 행을 유지합니다. 이는 이후에 더 낮은 버전을 가진 행이 삽입되더라도 안전하게 삽입할 수 있고, 삭제 행이 계속해서 적용될 수 있도록 하기 위함입니다.

이러한 삭제 행을 영구적으로 제거하려면, 테이블 설정 `allow_experimental_replacing_merge_with_cleanup`을 활성화한 후 다음 중 하나를 수행합니다.

1. 테이블 설정 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only`, `min_age_to_force_merge_seconds`를 설정합니다. 파티션의 모든 파트가 `min_age_to_force_merge_seconds`보다 오래된 경우, ClickHouse는 이들을
   모두 단일 파트로 머지하고 모든 삭제 행을 제거합니다.

2. `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`을 수동으로 실행합니다.
   :::

예:

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
```


select * from myThirdReplacingMT final;

0개의 행. 경과 시간: 0.003초.

-- is&#95;deleted가 설정된 행을 삭제합니다
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```
```


## 쿼리 절 \{#query-clauses\}

`ReplacingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

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
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`를 제외한 모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.

- `ver` - 버전 정보를 담는 컬럼입니다. 선택적 매개변수입니다. 설명은 위의 본문을 참조하십시오.

</details>



## 쿼리 시점 중복 제거 &amp; FINAL \{#query-time-de-duplication--final\}

병합 시점에 ReplacingMergeTree는 `ORDER BY` 컬럼(테이블 생성에 사용된 컬럼)의 값을 고유 식별자로 사용하여 중복된 행을 식별하고, 가장 높은 버전만 유지합니다. 그러나 이는 시간이 지나 최종적으로만 올바른 상태를 제공할 뿐이며, 행이 반드시 중복 제거된다고 보장하지 않으므로 이에 의존해서는 안 됩니다. 따라서 업데이트 및 삭제 행이 쿼리에 함께 포함되면서 잘못된 결과를 반환할 수 있습니다.

정확한 결과를 얻으려면, 백그라운드 병합에 더해 쿼리 시점 중복 제거 및 삭제 행 제거를 함께 수행해야 합니다. 이는 `FINAL` 연산자를 사용하여 달성할 수 있습니다. 예를 들어, 다음 예를 보십시오:

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

`FINAL` 없이 쿼리하면 잘못된 개수가 반환됩니다(정확한 값은 병합 상태에 따라 달라집니다):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

final을 추가하면 올바른 결과를 얻을 수 있습니다:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`에 대한 더 자세한 내용과 특히 `FINAL` 성능을 최적화하는 방법은 [ReplacingMergeTree에 대한 상세 가이드](/guides/replacing-merge-tree)를 참고하시기 바랍니다.
