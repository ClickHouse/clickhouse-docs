---
slug: /guides/developer/deduplicating-inserts-on-retries
title: '재시도 시 Insert 중복 제거'
description: 'Insert 작업 재시도 시 중복 데이터를 방지'
keywords: ['deduplication', 'deduplicate', 'insert retries', 'inserts']
doc_type: 'guide'
---

Insert 작업은 타임아웃과 같은 오류로 인해 실패할 수 있습니다. Insert가 실패한 경우, 데이터가 성공적으로 삽입되었는지는 확실하지 않을 수 있습니다. 이 가이드는 Insert 재시도 시 중복 제거를 활성화하여 동일한 데이터가 두 번 이상 삽입되지 않도록 하는 방법을 설명합니다.

Insert가 재시도되면 ClickHouse는 해당 데이터가 이미 성공적으로 삽입되었는지 판단하려고 합니다. 삽입된 데이터가 중복으로 식별되면 ClickHouse는 이를 대상 테이블에 삽입하지 않습니다. 그러나 사용자는 데이터가 정상적으로 삽입된 것과 마찬가지로 작업 성공 상태를 받게 됩니다.

## 제한 사항 \{#limitations\}

### 불확실한 INSERT 상태 \{#uncertain-insert-status\}

사용자는 INSERT 작업이 성공할 때까지 계속 재시도해야 합니다. 모든 재시도가 실패하면 데이터가 INSERT 되었는지 여부를 판단할 수 없습니다. materialized view가 관련된 경우, 어떤 테이블에 데이터가 나타났을지 역시 불분명합니다. materialized view는 소스 테이블과 동기화되지 않았을 수 있습니다.

### 중복 제거 윈도우 제한 \{#deduplication-window-limit\}

재시도 과정 동안 `*_deduplication_window` 값보다 많은 다른 insert 작업이 발생하면, 중복 제거가 의도한 대로 동작하지 않을 수 있습니다. 이 경우 동일한 데이터가 여러 번 삽입될 수 있습니다.

## 재시도 시 INSERT 중복 제거를 활성화하기 \{#enabling-insert-deduplication-on-retries\}

### 테이블에 대한 삽입 중복 제거 \{#insert-deduplication-for-tables\}

**`*MergeTree` 엔진만 삽입 시 중복 제거를 지원합니다.**

`*ReplicatedMergeTree` 엔진에서는 삽입 중복 제거가 기본적으로 활성화되어 있으며 [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window) 및 [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 설정으로 제어됩니다. 비복제 `*MergeTree` 엔진에서는 중복 제거가 [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window) 설정으로 제어됩니다.

위 설정은 테이블의 중복 제거 로그 매개변수를 결정합니다. 중복 제거 로그는 유한한 수의 `block_id`를 저장하며, 이를 통해 중복 제거 동작 방식이 결정됩니다(아래 참조).

### 쿼리 수준 삽입 중복 제거 \{#query-level-insert-deduplication\}

`insert_deduplicate=1` 설정은 쿼리 수준에서 중복 제거를 활성화합니다. `insert_deduplicate=0`으로 데이터를 삽입한 경우, 이후 `insert_deduplicate=1`로 다시 삽입을 시도하더라도 해당 데이터는 중복 제거되지 않습니다. 이는 `insert_deduplicate=0`으로 삽입할 때는 블록에 대해 `block_id`가 기록되지 않기 때문입니다.

## 삽입 중복 제거 작동 방식 \{#how-insert-deduplication-works\}

데이터가 ClickHouse에 삽입되면, 행 수와 바이트 수를 기준으로 데이터가 블록 단위로 분할됩니다.

`*MergeTree` 엔진을 사용하는 테이블의 경우, 각 블록에는 해당 블록의 데이터에 대한 해시 값인 고유한 `block_id`가 할당됩니다. 이 `block_id`는 삽입 작업을 위한 고유 키로 사용됩니다. 동일한 `block_id`가 중복 제거 로그에서 발견되면, 해당 블록은 중복된 것으로 간주되어 테이블에 삽입되지 않습니다.

이 방식은 삽입되는 데이터가 서로 다른 경우에는 잘 동작합니다. 그러나 동일한 데이터를 의도적으로 여러 번 삽입하는 경우에는 `insert_deduplication_token` 설정을 사용하여 중복 제거 프로세스를 제어해야 합니다. 이 설정을 사용하면 각 삽입마다 고유 토큰을 지정할 수 있으며, ClickHouse는 이 토큰을 사용하여 데이터가 중복인지 여부를 판단합니다.

`INSERT ... VALUES` 쿼리의 경우, 삽입된 데이터를 블록으로 분할하는 방식은 설정에 의해 결정되며 항상 동일하게 동작합니다. 따라서 재시도 시에는 최초 작업과 동일한 설정 값을 사용하여 삽입을 수행해야 합니다.

`INSERT ... SELECT` 쿼리의 경우, 쿼리의 `SELECT` 부분이 매번 동일한 순서로 동일한 데이터를 반환하는 것이 중요합니다. 하지만 실제로 이를 달성하기는 어렵습니다. 재시도 시에도 데이터 순서를 안정적으로 유지하기 위해, 쿼리의 `SELECT` 부분에 `ORDER BY ALL` 구문을 정의해야 합니다. 현재는 쿼리에서 정확히 `ORDER BY ALL`을 사용해야 합니다. 일반적인 `ORDER BY`에 대한 지원은 아직 구현되지 않았으며, 이 경우 쿼리의 `SELECT` 부분은 안정적인 것으로 간주되지 않습니다. 또한 선택한 테이블이 재시도 사이에 갱신될 수 있다는 점을 유의해야 합니다. 이 경우 결과 데이터가 변경될 수 있고, 중복 제거가 발생하지 않습니다. 추가로, 대량의 데이터를 삽입하는 상황에서는 삽입 후 블록 수가 중복 제거 로그 윈도우를 초과할 수 있으며, 이 경우 ClickHouse는 해당 블록을 중복 제거해야 한다는 사실을 인지하지 못하게 됩니다.
현재 `INSERT ... SELECT`에 대한 동작은 `insert_select_deduplicate` 설정으로 제어됩니다. 이 설정은 `INSERT ... SELECT` 쿼리를 사용하여 삽입된 데이터에 중복 제거를 적용할지 여부를 결정합니다. 자세한 내용과 사용 예시는 링크된 문서를 참고하십시오.

## materialized view를 사용한 삽입 중복 제거 \{#insert-deduplication-with-materialized-views\}

테이블에 하나 이상의 materialized view가 있는 경우, 삽입된 데이터는 정의된 변환을 거쳐 해당 뷰의 대상 테이블에도 삽입됩니다. 변환된 데이터 역시 재시도 시 중복 제거가 수행됩니다. ClickHouse는 대상 테이블에 삽입된 데이터를 중복 제거하는 방식과 동일한 방식으로 materialized view에 대해서도 중복 제거를 수행합니다.

다음 설정을 사용하여 소스 테이블에 대한 이 프로세스를 제어할 수 있습니다:

- [`replicated_deduplication_window`](/operations/settings/merge-tree-settings#replicated_deduplication_window)
- [`replicated_deduplication_window_seconds`](/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)
- [`non_replicated_deduplication_window`](/operations/settings/merge-tree-settings#non_replicated_deduplication_window)

또한 사용자 프로필 설정 [`deduplicate_blocks_in_dependent_materialized_views`](/operations/settings/settings#deduplicate_blocks_in_dependent_materialized_views)을(를) 활성화해야 합니다.
`insert_deduplicate=1` 설정이 활성화된 경우, 삽입된 데이터는 소스 테이블에서 중복 제거됩니다. `deduplicate_blocks_in_dependent_materialized_views=1` 설정은 종속 테이블에서의 중복 제거를 추가로 활성화합니다. 전체 중복 제거를 원한다면 두 설정을 모두 활성화해야 합니다.

materialized view가 연결된 테이블에 블록을 삽입할 때, ClickHouse는 소스 테이블의 `block_id`와 추가 식별자를 결합한 문자열을 해싱하여 `block_id`를 계산합니다. 이를 통해 materialized view 내에서 정확한 중복 제거가 보장되며, materialized view 하위 대상 테이블에 도달하기 전에 어떤 변환이 적용되었는지와 관계없이, 데이터가 원래 삽입 단위를 기준으로 구분되도록 합니다.

## 예제 \{#examples\}

### materialized view 변환 이후의 동일한 블록 \{#identical-blocks-after-materialized-view-transformations\}

materialized view 내부에서 변환 과정 중에 생성된 동일한 블록은 서로 다른 삽입된 데이터에 기반하기 때문에 중복 제거되지 않습니다.

예시는 다음과 같습니다:

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;
```

```sql
SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

위 설정을 사용하면 한 행만 포함된 일련의 블록으로 이루어진 테이블에서 선택할 수 있습니다. 이러한 작은 블록은 병합되지 않으며 테이블에 삽입될 때까지 그대로 유지됩니다.

```sql
SET deduplicate_blocks_in_dependent_materialized_views=1;
```

materialized view에서 중복 제거를 활성화해야 합니다:

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

여기서 `dst` 테이블에 2개의 파트가 삽입된 것을 확인할 수 있습니다. select 결과의 2개 블록은 insert 시 2개의 파트로 삽입됩니다. 이 파트들에는 서로 다른 데이터가 포함되어 있습니다.

```sql
SELECT
    *,
    _part
FROM mv_dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

여기서 `mv_dst` 테이블에 2개의 파트가 삽입된 것을 확인할 수 있습니다. 이 파트들은 동일한 데이터를 포함하고 있지만 아직 중복 제거되지는 않았습니다.

```sql
INSERT INTO dst SELECT
    number + 1 AS key,
    IF(key = 0, 'A', 'B') AS value
FROM numbers(2);

SELECT
    *,
    _part
FROM dst
ORDER BY all;

┌─key─┬─value─┬─_part─────┐
│   1 │ B     │ all_0_0_0 │
│   2 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘

SELECT
    *,
    _part
FROM mv_dst
ORDER by all;

┌─key─┬─value─┬─_part─────┐
│   0 │ B     │ all_0_0_0 │
│   0 │ B     │ all_1_1_0 │
└─────┴───────┴───────────┘
```

여기서는 삽입을 다시 시도했을 때 모든 데이터가 중복 제거되는 것을 확인할 수 있습니다. 중복 제거는 `dst` 테이블과 `mv_dst` 테이블 모두에 적용됩니다.


### 삽입 시 동일 블록 \{#identical-blocks-on-insertion\}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

삽입:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2);

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘
```

위와 같은 설정에서는 `select` 결과로 두 개의 블록이 생성되므로, 테이블 `dst`에는 두 개의 블록이 삽입되어야 합니다. 그러나 실제로는 테이블 `dst`에 하나의 블록만 삽입된 것을 확인할 수 있습니다. 이는 두 번째 블록이 중복 제거되었기 때문입니다. 두 블록은 동일한 데이터와, 삽입된 데이터로부터 해시로 계산되는 중복 제거 키 `block_id`를 공유합니다. 이러한 동작은 예상했던 것과 다릅니다. 이런 경우는 드물지만, 이론적으로는 발생할 수 있습니다. 이러한 경우를 올바르게 처리하려면, 사용자가 `insert_deduplication_token` 값을 지정해야 합니다. 다음 예제를 통해 이를 수정해 보겠습니다:


### 삽입 시 `insert_deduplication_token`을 사용한 동일 블록 처리 \{#identical-blocks-in-insertion-with-insert_deduplication_token\}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

SET max_block_size=1;
SET min_insert_block_size_rows=0;
SET min_insert_block_size_bytes=0;
```

데이터 삽입:

```sql
INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

동일한 블록 두 개가 예상대로 삽입되었습니다.

```sql
SELECT 'second attempt';

INSERT INTO dst SELECT
    0 AS key,
    'A' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

삽입을 재시도해도 예상대로 중복이 제거됩니다.

```sql
SELECT 'third attempt';

INSERT INTO dst SELECT
    1 AS key,
    'b' AS value
FROM numbers(2)
SETTINGS insert_deduplication_token='some_user_token';

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   0 │ A     │ all_2_2_0 │
│ from dst   │   0 │ A     │ all_3_3_0 │
└────────────┴─────┴───────┴───────────┘
```

해당 삽입 작업은 삽입된 데이터가 서로 다르더라도 역시 중복 제거됩니다. `insert_deduplication_token`이 설정된 경우에는 이 값이 우선 적용된다는 점에 유의하십시오. 이때 ClickHouse는 데이터의 해시 합계를 사용하지 않습니다.


### materialized view의 기본 테이블에서 변환이 이뤄진 후에는 서로 다른 insert 작업도 동일한 데이터를 생성합니다 \{#different-insert-operations-generate-the-same-data-after-transformation-in-the-underlying-table-of-the-materialized-view\}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
└───────────────┴─────┴───────┴───────────┘

select 'second attempt';

INSERT INTO dst VALUES (2, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
│ from dst   │   2 │ A     │ all_1_1_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

매번 서로 다른 데이터를 삽입하지만 `mv_dst` 테이블에는 동일한 데이터가 삽입됩니다. 소스 데이터가 서로 달랐기 때문에 데이터는 중복 제거되지 않습니다.


### 여러 materialized view가 동일한 데이터를 하나의 기본 테이블에 삽입하는 경우 \{#different-materialized-view-inserts-into-one-underlying-table-with-equivalent-data\}

```sql
CREATE TABLE dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE TABLE mv_dst
(
    `key` Int64,
    `value` String
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS non_replicated_deduplication_window=1000;

CREATE MATERIALIZED VIEW mv_first
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

CREATE MATERIALIZED VIEW mv_second
TO mv_dst
AS SELECT
    0 AS key,
    value AS value
FROM dst;

SET deduplicate_blocks_in_dependent_materialized_views=1;

select 'first attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER by all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

동일한 두 개의 블록이 테이블 `mv_dst`에 삽입되었습니다(예상한 대로입니다).

```sql
SELECT 'second attempt';

INSERT INTO dst VALUES (1, 'A');

SELECT
    'from dst',
    *,
    _part
FROM dst
ORDER BY all;

┌─'from dst'─┬─key─┬─value─┬─_part─────┐
│ from dst   │   1 │ A     │ all_0_0_0 │
└────────────┴─────┴───────┴───────────┘

SELECT
    'from mv_dst',
    *,
    _part
FROM mv_dst
ORDER by all;

┌─'from mv_dst'─┬─key─┬─value─┬─_part─────┐
│ from mv_dst   │   0 │ A     │ all_0_0_0 │
│ from mv_dst   │   0 │ A     │ all_1_1_0 │
└───────────────┴─────┴───────┴───────────┘
```

해당 재시도 작업은 `dst` 테이블과 `mv_dst` 테이블 모두에서 중복이 제거됩니다.
