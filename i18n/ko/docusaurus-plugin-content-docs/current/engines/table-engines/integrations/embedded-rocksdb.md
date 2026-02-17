---
description: '이 엔진은 ClickHouse를 RocksDB와 통합할 수 있도록 합니다.'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'EmbeddedRocksDB 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# EmbeddedRocksDB 테이블 엔진 \{#embeddedrocksdb-table-engine\}

<CloudNotSupportedBadge />

이 엔진을 사용하면 ClickHouse와 [RocksDB](http://rocksdb.org/)를 통합할 수 있습니다.

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

Engine parameters:

* `ttl` - 값의 TTL(time to live)을 지정합니다. TTL은 초 단위로 설정됩니다. TTL이 0이면 일반 RocksDB 인스턴스가 사용됩니다(TTL 없음).
* `rocksdb_dir` - 기존 RocksDB의 디렉터리 경로 또는 새로 생성되는 RocksDB의 대상 경로입니다. 지정된 `rocksdb_dir`로 테이블을 엽니다.
* `read_only` - `read_only`가 true로 설정되면 읽기 전용 모드가 사용됩니다. TTL이 있는 스토리지의 경우 수동 및 자동 압축(compaction)이 트리거되지 않으므로, 만료된 엔트리가 제거되지 않습니다.
* `primary_key_name` – 컬럼 목록에 포함된 임의의 컬럼 이름입니다.
* `primary key`는 반드시 지정해야 하며, 기본 키는 단일 컬럼만 지원합니다. 기본 키는 `rocksdb key`로 바이너리 직렬화됩니다.
* 기본 키를 제외한 컬럼들은 해당 순서대로 `rocksdb` value로 바이너리 직렬화됩니다.
* 키에 대한 `equals` 또는 `in` 필터링이 있는 쿼리는 `rocksdb`의 멀티 키 조회로 최적화됩니다.

Engine settings:

* `optimize_for_bulk_insert` – 테이블을 대량 삽입에 최적화합니다(삽입 파이프라인이 memtables에 쓰는 대신 SST 파일을 생성하여 rocksdb 데이터베이스로 가져옵니다); 기본값: `1`.
* `bulk_insert_block_size` - 대량 삽입으로 생성되는 SST 파일의 최소 크기(행 기준)입니다; 기본값: `1048449`.

Example:

```sql
CREATE TABLE test
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

## 메트릭 \{#metrics\}

또한 RocksDB 통계를 제공하는 `system.rocksdb` 테이블도 있습니다.

```sql
SELECT
    name,
    value
FROM system.rocksdb

┌─name──────────────────────┬─value─┐
│ no.file.opens             │     1 │
│ number.block.decompressed │     1 │
└───────────────────────────┴───────┘
```

## 구성 \{#configuration\}

또한 설정(config)을 통해 [rocksdb 옵션](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map)을 변경할 수도 있습니다.

```xml
<rocksdb>
    <options>
        <max_background_jobs>8</max_background_jobs>
    </options>
    <column_family_options>
        <num_levels>2</num_levels>
    </column_family_options>
    <tables>
        <table>
            <name>TABLE</name>
            <options>
                <max_background_jobs>8</max_background_jobs>
            </options>
            <column_family_options>
                <num_levels>2</num_levels>
            </column_family_options>
        </table>
    </tables>
</rocksdb>
```

기본적으로 단순 근사 카운트 최적화는 비활성화되어 있어 `count()` 쿼리의 성능에 영향을 줄 수 있습니다. 이 최적화를 활성화하려면
`optimize_trivial_approximate_count_query = 1`을(를) 설정하십시오. 또한 이 설정은 EmbeddedRocksDB 엔진의 `system.tables`에도 영향을 미치므로,
이 설정을 켜면 `total_rows` 및 `total_bytes`에 대한 근사값을 확인할 수 있습니다.

## 지원되는 연산 \{#supported-operations\}

### 삽입 \{#inserts\}

새 행이 `EmbeddedRocksDB`에 삽입될 때, 키가 이미 존재하면 해당 값이 업데이트되고, 그렇지 않으면 새 키가 생성됩니다.

예시:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 삭제 \{#deletes\}

행은 `DELETE` 쿼리 또는 `TRUNCATE` 명령을 사용하여 삭제할 수 있습니다.

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### 업데이트 \{#updates\}

값은 `ALTER TABLE` 쿼리를 사용하여 변경할 수 있습니다. 기본 키는 변경할 수 없습니다.

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 조인 \{#joins\}

EmbeddedRocksDB 테이블에서는 특별한 `direct` 조인이 지원됩니다.
이 direct 조인은 메모리에서 해시 테이블을 생성하지 않고,
EmbeddedRocksDB에서 데이터를 직접 접근합니다.

대규모 조인에서는 해시 테이블이 생성되지 않으므로
direct 조인을 사용하면 메모리 사용량이 훨씬 줄어들 수 있습니다.

direct 조인을 활성화하려면 다음을 수행합니다:

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm`이 `direct, hash`로 설정되면 가능한 경우 direct 조인을 사용하고, 그렇지 않은 경우에는 hash 조인을 사용합니다.
:::

#### 예시 \{#example\}

##### EmbeddedRocksDB 테이블 생성 및 데이터 삽입 \{#create-and-populate-an-embeddedrocksdb-table\}

```sql
CREATE TABLE rdb
(
    `key` UInt32,
    `value` Array(UInt32),
    `value2` String
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

```sql
INSERT INTO rdb
    SELECT
        toUInt32(sipHash64(number) % 10) AS key,
        [key, key+1] AS value,
        ('val2' || toString(key)) AS value2
    FROM numbers_mt(10);
```

##### 테이블 `rdb`와 조인할 테이블을 생성하고 데이터를 삽입합니다 \{#create-and-populate-a-table-to-join-with-table-rdb\}

```sql
CREATE TABLE t2
(
    `k` UInt16
)
ENGINE = TinyLog
```

```sql
INSERT INTO t2 SELECT number AS k
FROM numbers_mt(10)
```

##### 조인 알고리즘을 `direct`로 설정합니다 \{#set-the-join-algorithm-to-direct\}

```sql
SET join_algorithm = 'direct'
```

##### 내부 조인(INNER JOIN) \{#an-inner-join\}

```sql
SELECT *
FROM
(
    SELECT k AS key
    FROM t2
) AS t2
INNER JOIN rdb ON rdb.key = t2.key
ORDER BY key ASC
```

```response
┌─key─┬─rdb.key─┬─value──┬─value2─┐
│   0 │       0 │ [0,1]  │ val20  │
│   2 │       2 │ [2,3]  │ val22  │
│   3 │       3 │ [3,4]  │ val23  │
│   6 │       6 │ [6,7]  │ val26  │
│   7 │       7 │ [7,8]  │ val27  │
│   8 │       8 │ [8,9]  │ val28  │
│   9 │       9 │ [9,10] │ val29  │
└─────┴─────────┴────────┴────────┘
```

### 조인에 대한 자세한 내용 \{#more-information-on-joins\}

* [`join_algorithm` 설정](/operations/settings/settings.md#join_algorithm)
* [JOIN 절](/sql-reference/statements/select/join.md)
