---
description: '이 엔진은 ClickHouse를 Redis와 통합할 수 있도록 해줍니다.'
sidebar_label: 'Redis'
sidebar_position: 175
slug: /engines/table-engines/integrations/redis
title: 'Redis 테이블 엔진'
doc_type: 'guide'
---



# Redis table engine \{#redis-table-engine\}

이 엔진을 사용하면 ClickHouse를 [Redis](https://redis.io/)와 통합할 수 있습니다. Redis는 키-값(kv) 모델을 사용하므로, `where k=xx` 또는 `where k in (xx, xx)`와 같이 포인트 조회 방식으로만 쿼리를 실행할 것을 강력히 권장합니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**엔진 매개변수**

* `host:port` — Redis 서버 주소입니다. 포트는 생략할 수 있으며, 기본 Redis 포트인 6379가 사용됩니다.
* `db_index` — Redis DB 인덱스 범위는 0부터 15까지이며, 기본값은 0입니다.
* `password` — 사용자 암호로, 기본값은 빈 문자열입니다.
* `pool_size` — Redis 최대 커넥션 풀 크기로, 기본값은 16입니다.
* `primary_key_name` - 컬럼 목록에 있는 임의의 컬럼 이름입니다.

:::note Serialization
`PRIMARY KEY`는 하나의 컬럼만 지원합니다. 기본 키는 Redis 키로 바이너리 형식으로 직렬화됩니다.
기본 키가 아닌 컬럼은 해당 순서대로 Redis 값으로 바이너리 형식으로 직렬화됩니다.
:::

매개변수는 [named collections](/operations/named-collections.md)를 사용해 전달할 수도 있습니다. 이 경우 `host`와 `port`는 별도로 지정해야 합니다. 이 방식은 프로덕션 환경에서 사용하기를 권장합니다. 현재는 named collections를 통해 Redis로 전달되는 모든 매개변수가 필수입니다.

:::note Filtering
`key equals` 또는 `in filtering` 조건이 있는 쿼리는 Redis에서 여러 키 조회로 최적화됩니다. 필터링 키 없이 쿼리를 실행하면 전체 테이블 스캔이 발생하며, 이는 부하가 큰 작업입니다.
:::


## 사용 예시 \{#usage-example\}

단순 인수를 사용하여 `Redis` 엔진으로 ClickHouse에 테이블을 생성합니다:

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

또는 [named collections](/operations/named-collections.md)을(를) 사용할 수 있습니다:

```xml
<named_collections>
    <redis_creds>
        <host>localhost</host>
        <port>6379</port>
        <password>****</password>
        <pool_size>16</pool_size>
        <db_index>s0</db_index>
    </redis_creds>
</named_collections>
```

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis(redis_creds) PRIMARY KEY(key);
```

INSERT:

```sql
INSERT INTO redis_table VALUES('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

쿼리:

```sql
SELECT COUNT(*) FROM redis_table;
```

```text
┌─count()─┐
│       2 │
└─────────┘
```

```sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

```sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

업데이트:

기본 키는 변경할 수 없습니다.

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

삭제 방법:

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

Truncate:

Redis DB를 비동기적으로 플러시합니다. 또한 `Truncate`는 동기(SYNC) 모드도 지원합니다.

```sql
TRUNCATE TABLE redis_table SYNC;
```

Join:

다른 테이블과 조인을 수행합니다.

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```


## 제한 사항 \{#limitations\}

Redis 엔진은 `where k > xx`와 같은 스캔 쿼리도 지원하지만, 다음과 같은 제한 사항이 있습니다:
1. 리해싱이 진행되는 매우 드문 경우에는 스캔 쿼리에서 중복된 키가 조회될 수 있습니다. 자세한 내용은 [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)을 참조하십시오.
2. 스캔이 수행되는 동안 키가 생성되거나 삭제될 수 있으므로, 결과 데이터셋은 특정 시점을 나타내는 유효한 스냅샷이라고 볼 수 없습니다.
