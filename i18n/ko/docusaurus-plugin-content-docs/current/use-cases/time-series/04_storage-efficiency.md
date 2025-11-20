---
'title': '저장소 효율성 - 시계열'
'sidebar_label': '저장소 효율성'
'description': '시계열 저장소 효율성 향상'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
- 'storage efficiency'
- 'compression'
- 'data retention'
- 'TTL'
- 'storage optimization'
- 'disk usage'
'show_related_blogs': true
'doc_type': 'guide'
---


# 시계열 스토리지 효율성

위키백과 통계 데이터셋을 쿼리하는 방법을 탐색한 후, ClickHouse에서 저장 효율성을 최적화하는 데 집중해 보겠습니다. 이 섹션에서는 쿼리 성능을 유지하면서 저장 요구 사항을 줄이는 실제 기술을 보여줍니다.

## 타입 최적화 {#time-series-type-optimization}

저장 효율성을 최적화하는 일반적인 접근 방식은 최적의 데이터 타입을 사용하는 것입니다. `project` 및 `subproject` 컬럼을 살펴보겠습니다. 이 컬럼들은 String 타입이지만, 고유 값이 상대적으로 적습니다:

```sql
SELECT
    uniq(project),
    uniq(subproject)
FROM wikistat;
```

```text
┌─uniq(project)─┬─uniq(subproject)─┐
│          1332 │              130 │
└───────────────┴──────────────────┘
```

이는 LowCardinality() 데이터 타입을 사용할 수 있음을 의미합니다. 이 타입은 딕셔너리 기반 인코딩을 사용합니다. 이로 인해 ClickHouse는 원래 문자열 값 대신 내부 값 ID를 저장하게 되어 많은 공간이 절약됩니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

우리는 또한 `hits` 컬럼에 대해 UInt64 타입을 사용했습니다. 이는 8바이트를 차지하지만, 상대적으로 작은 최대 값을 가집니다:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

이 값을 고려할 때, 우리는 UInt32를 대신 사용할 수 있으며, 이는 4바이트만 차지하고 최대 약 ~4b까지 저장할 수 있습니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

이렇게 하면 메모리 내에서 이 컬럼의 크기가 최소한 두 배로 줄어듭니다. 디스크의 크기는 압축 때문에 변경되지 않는다는 점에 유의하세요. 하지만 조심하십시오; 너무 작은 데이터 타입은 선택하지 마세요!

## 전문 코덱 {#time-series-specialized-codecs}

우리가 시계열과 같은 순차적 데이터를 다룰 때, 특별한 코덱을 사용하여 저장 효율성을 더욱 향상시킬 수 있습니다. 일반적인 아이디어는 절대 값 대신 값 간의 변화만 저장하는 것입니다. 이는 느리게 변화하는 데이터를 다룰 때 필요한 공간을 상당히 줄여줍니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

우리는 `time` 컬럼에 대해 Delta 코덱을 사용했습니다. 이는 시계열 데이터에 적합합니다.

올바른 정렬 키를 사용하면 디스크 공간도 절약할 수 있습니다. 우리는 일반적으로 경로로 필터링하려기 때문에 `path`를 정렬 키에 추가할 것입니다. 이를 위해 테이블을 재생성해야 합니다.

아래에서 초기 테이블의 `CREATE` 명령과 최적화된 테이블을 볼 수 있습니다:

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

```sql
CREATE TABLE optimized_wikistat
(
    `time` DateTime CODEC(Delta(4), ZSTD(1)),
    `project` LowCardinality(String),
    `subproject` LowCardinality(String),
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (path, time);
```

각 테이블의 데이터가 차지하는 공간의 양을 살펴보겠습니다:

```sql
SELECT
    table,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed,
    count() AS parts
FROM system.parts
WHERE table LIKE '%wikistat%'
GROUP BY ALL;
```

```text
┌─table──────────────┬─uncompressed─┬─compressed─┬─parts─┐
│ wikistat           │ 35.28 GiB    │ 12.03 GiB  │     1 │
│ optimized_wikistat │ 30.31 GiB    │ 2.84 GiB   │     1 │
└────────────────────┴──────────────┴────────────┴───────┘
```

최적화된 테이블은 압축된 형식에서 4배 이상 적은 공간을 차지합니다.
