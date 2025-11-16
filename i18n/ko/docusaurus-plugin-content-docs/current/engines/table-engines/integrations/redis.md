---
'description': '이 엔진은 ClickHouse와 Redis를 통합할 수 있게 해줍니다.'
'sidebar_label': 'Redis'
'sidebar_position': 175
'slug': '/engines/table-engines/integrations/redis'
'title': 'Redis 테이블 엔진'
'doc_type': 'guide'
---


# Redis 테이블 엔진

이 엔진은 ClickHouse와 [Redis](https://redis.io/)를 통합할 수 있게 해줍니다. Redis는 kv 모델을 사용하므로, `where k=xx` 또는 `where k in (xx, xx)`와 같이 포인터 방식으로만 쿼리하는 것을 강력히 권장합니다.

## 테이블 생성 {#creating-a-table}

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

- `host:port` — Redis 서버 주소, 포트는 무시할 수 있으며 기본 Redis 포트인 6379가 사용됩니다.
- `db_index` — Redis db 인덱스 범위는 0에서 15까지이며, 기본값은 0입니다.
- `password` — 사용자 비밀번호, 기본값은 빈 문자열입니다.
- `pool_size` — Redis 최대 연결 풀 크기, 기본값은 16입니다.
- `primary_key_name` - 컬럼 목록에 있는 임의의 컬럼 이름입니다.

:::note 직렬화
`PRIMARY KEY`는 오직 하나의 컬럼만 지원합니다. 기본 키는 Redis 키로 이진 형식으로 직렬화됩니다. 기본 키 외의 컬럼은 해당 순서에 따라 Redis 값으로 이진 형식으로 직렬화됩니다.
:::

인수는 [named collections](/operations/named-collections.md)를 사용하여 전달될 수도 있습니다. 이 경우 `host`와 `port`는 별도로 지정해야 합니다. 이 접근법은 프로덕션 환경에서 권장됩니다. 현재로서는 named collections을 통해 Redis에 전달되는 모든 매개변수가 필수입니다.

:::note 필터링
`key equals` 또는 `in filtering` 쿼리는 Redis에서 다중 키 조회로 최적화됩니다. 필터링 키 없이 쿼리할 경우 전체 테이블 스캔이 발생하며 이는 무거운 작업입니다.
:::

## 사용 예시 {#usage-example}

평범한 인수를 사용하여 `Redis` 엔진으로 ClickHouse에서 테이블을 생성합니다:

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

또는 [named collections](/operations/named-collections.md)을 사용하여:

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

삽입:

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

기본 키는 업데이트할 수 없음을 유의하십시오.

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

삭제:

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

트렁크:

Redis db를 비동기적으로 플러시합니다. 또한 `Truncate`는 SYNC 모드를 지원합니다.

```sql
TRUNCATE TABLE redis_table SYNC;
```

조인:

다른 테이블과 조인합니다.

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 제한 사항 {#limitations}

Redis 엔진은 `where k > xx`와 같은 스캐닝 쿼리도 지원하지만 몇 가지 제한 사항이 있습니다:
1. 스캐닝 쿼리는 해시 재구성이 발생하는 매우 드문 경우에 중복된 키를 생성할 수 있습니다. 자세한 내용은 [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)을 참조하십시오.
2. 스캐닝 중에 키가 생성되거나 삭제될 수 있어, 결과 데이터셋은 유효한 시점을 나타내지 않을 수 있습니다.
