---
'description': 'Optimize 的文档'
'sidebar_label': 'OPTIMIZE'
'sidebar_position': 47
'slug': '/sql-reference/statements/optimize'
'title': 'OPTIMIZE 语句'
'doc_type': 'reference'
---

이 쿼리는 테이블의 데이터 파트를 비정기적으로 병합하도록 초기화하려고 합니다. 일반적으로 `OPTIMIZE TABLE ... FINAL` 사용을 권장하지 않으며(관리 용도로 사용되기 때문에 일상적인 작업에는 적합하지 않습니다. 자세한 내용은 이 [문서](/optimize/avoidoptimizefinal)를 참조하세요.)

:::note
`OPTIMIZE`는 `Too many parts` 오류를 수정할 수 없습니다.
:::

**구문**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` 쿼리는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 계열(물리화된 뷰 포함 [materialized views](/sql-reference/statements/create/view#materialized-view)) 및 [Buffer](../../engines/table-engines/special/buffer.md) 엔진에서 지원됩니다. 다른 테이블 엔진은 지원되지 않습니다.

`OPTIMIZE`가 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) 계열의 테이블 엔진과 함께 사용될 때, ClickHouse는 병합 작업을 생성하고 모든 복제본에서 실행을 기다리거나(만약 [alter_sync](/operations/settings/settings#alter_sync) 설정이 `2`로 설정되면) 현재 복제본에서(설정이 `1`로 설정되면) 실행을 기다립니다.

- `OPTIMIZE`가 어떤 이유로든 병합을 수행하지 않으면 클라이언트에게 알리지 않습니다. 알림을 활성화하려면 [optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 설정을 사용하세요.
- `PARTITION`을 지정하면 지정된 파티션만 최적화됩니다. [파티션 표현식 설정 방법](alter/partition.md#how-to-set-partition-expression)입니다.
- `FINAL` 또는 `FORCE`를 지정하면 모든 데이터가 이미 하나의 파트에 있어도 최적화가 수행됩니다. 이 동작은 [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions)로 제어할 수 있습니다. 또한, 동시 병합이 수행되더라도 병합이 강제됩니다.
- `DEDUPLICATE`를 지정하면 완전히 동일한 행(바이 클라우스를 지정하지 않은 경우)이 중복 제거됩니다(모든 컬럼이 비교됨), 이는 MergeTree 엔진에만 해당합니다.

비활성 복제본이 `OPTIMIZE` 쿼리를 실행하기 위해 기다리는 시간을 초 단위로 지정할 수 있습니다. [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정을 사용하세요.

:::note    
`alter_sync`가 `2`로 설정되어 있고, 일부 복제본이 `replication_wait_for_inactive_replica_timeout` 설정으로 지정된 시간 이상 비활성 상태인 경우, `UNFINISHED` 예외가 발생합니다.
:::

## BY 표현식 {#by-expression}

모든 컬럼이 아닌 특정 컬럼 집합에 대해 중복 제거를 수행하려는 경우, 컬럼 목록을 명시적으로 지정하거나 [`*`](../../sql-reference/statements/select/index.md#asterisk), [`COLUMNS`](/sql-reference/statements/select#select-clause) 또는 [`EXCEPT`](/sql-reference/statements/select/except-modifier) 표현식을 조합하여 사용할 수 있습니다. 명시적으로 작성된 또는 암시적으로 확장된 컬럼 목록은 행 정렬 표현식(기본 및 정렬 키 모두)과 파티션 표현식(파티션 키)에 지정된 모든 컬럼을 포함해야 합니다.

:::note    
`*`는 `SELECT`에서와 같이 작동하는 점에 유의하세요: [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 및 [ALIAS](../../sql-reference/statements/create/table.md#alias) 컬럼은 확장에서 사용되지 않습니다.

빈 컬럼 목록을 지정하거나 결과적으로 빈 컬럼 목록을 생성하는 표현식을 작성하는 것은 오류입니다. 또는 `ALIAS` 컬럼으로 중복 제거하는 것도 오류입니다.
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

다음 테이블을 고려해 보세요:

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

다음 모든 예제는 5개의 행이 있는 이 상태에서 실행됩니다.

#### `DEDUPLICATE` {#deduplicate}
중복 제거할 컬럼을 지정하지 않으면, 모든 컬럼이 고려됩니다. 행은 모든 컬럼의 값이 이전 행의 해당 값과 같을 경우에만 제거됩니다:

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

#### `DEDUPLICATE BY *` {#deduplicate-by-}

컬럼이 암시적으로 지정된 경우, 테이블은 `ALIAS` 또는 `MATERIALIZED`가 아닌 모든 컬럼에 대해 중복 제거됩니다. 위의 테이블을 고려할 때, `primary_key`, `secondary_key`, `value`, 및 `partition_key` 컬럼이 이에 해당됩니다:

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

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}
`ALIAS` 또는 `MATERIALIZED`가 아닌 모든 컬럼에 대해 중복 제거하며, 명시적으로 `value`를 제외합니다: `primary_key`, `secondary_key`, 및 `partition_key` 컬럼입니다.

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

#### `DEDUPLICATE BY <list of columns>` {#deduplicate-by-list-of-columns}

`primary_key`, `secondary_key`, 및 `partition_key` 컬럼에 대해 명시적으로 중복 제거합니다:

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

#### `DEDUPLICATE BY COLUMNS(<regex>)` {#deduplicate-by-columnsregex}

정규 표현식에 일치하는 모든 컬럼에 대해 중복 제거합니다: `primary_key`, `secondary_key`, 및 `partition_key` 컬럼입니다:

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
