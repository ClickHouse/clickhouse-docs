---
description: 'Optimize에 대한 문서'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE SQL 문'
doc_type: 'reference'
---

이 쿼리는 테이블의 데이터 파트에 대해 스케줄되지 않은 병합을 수행하도록 시도합니다. 일반적으로 `OPTIMIZE TABLE ... FINAL` 사용은 권장되지 않습니다(일상적인 운영이 아니라 관리 작업을 위한 기능이므로, 자세한 사용 사례는 이 [문서](/optimize/avoidoptimizefinal)를 참조하십시오).

:::note
`OPTIMIZE`로 `Too many parts` 오류를 해결할 수는 없습니다.
:::

**구문**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

```sql
OPTIMIZE TABLE [db.]name DRY RUN PARTS 'part_name1', 'part_name2' [, ...] [DEDUPLICATE [BY expression]] [CLEANUP]
```

`OPTIMIZE` 쿼리는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 패밀리(여기에는 [materialized views](/sql-reference/statements/create/view#materialized-view) 포함)와 [Buffer](../../engines/table-engines/special/buffer.md) 엔진에서 지원됩니다. 다른 테이블 엔진은 지원되지 않습니다.

`OPTIMIZE`를 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 테이블 엔진 패밀리와 함께 사용하는 경우, ClickHouse는 머지 작업을 생성하고 모든 레플리카에서 실행이 완료되기를 기다리거나([alter&#95;sync](/operations/settings/settings#alter_sync) 설정이 `2`로 설정된 경우), 현재 레플리카에서만 기다립니다([alter&#95;sync](/operations/settings/settings#alter_sync) 설정이 `1`로 설정된 경우).

* 어떤 이유로든 `OPTIMIZE`가 머지를 수행하지 않더라도 클라이언트에 이를 알리지 않습니다. 알림을 활성화하려면 [optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 설정을 사용하십시오.
* `PARTITION`을 지정하면, 지정한 파티션만 최적화됩니다. [파티션 표현식을 설정하는 방법](alter/partition.md#how-to-set-partition-expression)을 참고하십시오.
* `FINAL` 또는 `FORCE`를 지정하면, 모든 데이터가 이미 하나의 파트에 있는 경우에도 최적화가 수행됩니다. 이 동작은 [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions)로 제어할 수 있습니다. 또한, 동시에 다른 머지가 수행 중이더라도 머지가 강제로 실행됩니다.
* `DEDUPLICATE`를 지정하면, 완전히 동일한 행(별도의 BY 절이 지정되지 않은 경우)이 중복 제거됩니다(모든 컬럼이 비교됨). 이는 MergeTree 엔진에서만 의미가 있습니다.

비활성 레플리카가 `OPTIMIZE` 쿼리를 실행할 때까지 얼마나 오래(초 단위) 기다릴지 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정으로 지정할 수 있습니다.

:::note
`alter_sync`가 `2`로 설정되어 있고, 일부 레플리카가 `replication_wait_for_inactive_replica_timeout` 설정으로 지정된 시간보다 더 오래 비활성 상태인 경우, `UNFINISHED` 예외가 발생합니다.
:::

## DRY RUN \{#dry-run\}

`DRY RUN` 절은 지정한 파트의 머지 작업을 결과를 커밋하지 않고 시뮬레이션합니다. 머지된 파트는 임시 위치에 기록한 뒤 검증되고, 그 후 폐기됩니다. 원래 파트와 테이블 데이터는 변경되지 않습니다.

다음과 같은 경우에 유용합니다:

* ClickHouse 버전 간 머지의 정확성을 테스트할 때
* 머지 관련 버그를 결정론적으로 재현할 때
* 머지 성능을 벤치마크할 때

`DRY RUN`은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 계열 테이블에서만 지원됩니다. 파트 이름 목록과 함께 `PARTS` 키워드를 지정해야 합니다. 지정된 모든 파트는 존재하고 활성 상태이며, 동일한 파티션에 속해야 합니다.

`DRY RUN`은 `FINAL` 및 `PARTITION`과 함께 사용할 수 없습니다. `DEDUPLICATE`(선택적인 컬럼 지정 가능) 및 `CLEANUP`( `ReplacingMergeTree` 테이블에 대해)과는 함께 사용할 수 있습니다.

**구문**

```sql
OPTIMIZE TABLE [db.]name DRY RUN PARTS 'part_name1', 'part_name2' [, ...] [DEDUPLICATE [BY expression]] [CLEANUP]
```

기본적으로 병합 결과로 생성된 파트는 [`CHECK TABLE`](/sql-reference/statements/check-table) 쿼리와 유사한 방식으로 검증됩니다. 이 동작은 [optimize&#95;dry&#95;run&#95;check&#95;part](/operations/settings/settings#optimize_dry_run_check_part) 설정(기본적으로 활성화됨)에 의해 제어됩니다. 이 설정을 비활성화하면 검증을 건너뛰게 되며, 병합 자체를 벤치마킹하는 데 유용할 수 있습니다.

**예시**

```sql
CREATE TABLE dry_run_example (key UInt64, value String) ENGINE = MergeTree ORDER BY key;

INSERT INTO dry_run_example VALUES (1, 'a'), (2, 'b');
INSERT INTO dry_run_example VALUES (1, 'c'), (4, 'd');

-- Simulate merging using two parts
OPTIMIZE TABLE dry_run_example DRY RUN PARTS 'all_1_1_0', 'all_2_2_0';

-- Simulate merging with deduplication
OPTIMIZE TABLE dry_run_example DRY RUN PARTS 'all_1_1_0', 'all_2_2_0' DEDUPLICATE;

-- Parts and data remain unchanged after DRY RUN
SELECT name, rows FROM system.parts
WHERE database = currentDatabase() AND table = 'dry_run_example' AND active
ORDER BY name;
```

```response
┌─name────────┬─rows─┐
│ all_1_1_0   │    2 │
│ all_2_2_0   │    2 │
└─────────────┴──────┘
```

## BY 표현식 \{#by-expression\}

모든 컬럼이 아니라 사용자 정의 컬럼 집합에 대해 중복 제거를 수행하려면, 컬럼 목록을 명시적으로 지정하거나 [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause), [`EXCEPT`](/sql-reference/statements/select/except-modifier) 표현식을 임의로 조합하여 사용할 수 있습니다. 명시적으로 작성되었거나 암묵적으로 확장된 컬럼 목록에는 행 정렬 표현식(기본 키와 정렬 키 모두)과 파티션 표현식(파티셔닝 키)에 지정된 모든 컬럼이 포함되어야 합니다.

:::note
`*`는 `SELECT`에서와 동일하게 동작합니다. [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 및 [ALIAS](../../sql-reference/statements/create/table.md#alias) 컬럼은 확장에 사용되지 않습니다.

또한, 빈 컬럼 목록을 지정하거나 결과적으로 빈 컬럼 목록이 되는 표현식을 작성하거나, `ALIAS` 컬럼 기준으로 중복 제거를 수행하는 것은 오류가 발생합니다.
:::

**구문**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- all columns
OPTIMIZE TABLE table DEDUPLICATE BY *; -- excludes MATERIALIZED and ALIAS columns
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**예제**

다음 테이블을 살펴보십시오:

```sql
CREATE TABLE example (
    primary_key Int32,
    secondary_key Int32,
    value UInt32,
    partition_key UInt32,
    materialized_value UInt32 MATERIALIZED 12345,
    aliased_value UInt32 ALIAS 2,
    PRIMARY KEY primary_key
) ENGINE=MergeTree
PARTITION BY partition_key
ORDER BY (primary_key, secondary_key);
```

```sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

```sql
SELECT * FROM example;
```

결과:

```sql

┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

이후의 모든 예시는 5개의 행이 있는 이 상태를 기준으로 실행됩니다.

#### `DEDUPLICATE` \{#deduplicate\}

중복 제거 기준 컬럼이 지정되지 않으면 모든 컬럼이 사용됩니다. 모든 컬럼의 값이 바로 이전 행의 해당 컬럼 값과 모두 동일한 경우에만 해당 행이 제거됩니다:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

```sql
SELECT * FROM example;
```

결과:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY *` \{#deduplicate-by-\}

컬럼을 암시적으로 지정하는 경우, `ALIAS` 또는 `MATERIALIZED`가 아닌 모든 컬럼을 기준으로 테이블의 중복이 제거됩니다. 위의 테이블을 기준으로 하면, 해당 컬럼은 `primary_key`, `secondary_key`, `value`, `partition_key` 컬럼입니다:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

결과:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY * EXCEPT` \{#deduplicate-by--except\}

`ALIAS` 또는 `MATERIALIZED`가 아니면서, 명시적으로 `value`가 아닌 모든 컬럼(예: `primary_key`, `secondary_key`, `partition_key` 컬럼)을 기준으로 중복 행을 제거합니다.

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

```sql
SELECT * FROM example;
```

결과:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY <list of columns>` \{#deduplicate-by-list-of-columns\}

`primary_key`, `secondary_key`, `partition_key` 컬럼을 기준으로 명시적으로 중복을 제거합니다:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

```sql
SELECT * FROM example;
```

결과:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY COLUMNS(<regex>)` \{#deduplicate-by-columnsregex\}

정규식과 일치하는 모든 컬럼(예: `primary_key`, `secondary_key`, `partition_key` 컬럼)을 기준으로 중복을 제거합니다.

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

결과:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```
