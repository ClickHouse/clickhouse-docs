---
title: '스토리지 효율성 - 시계열'
sidebar_label: '스토리지 효율성'
description: '시계열 스토리지 효율성 향상'
slug: /use-cases/time-series/storage-efficiency
keywords: ['시계열', '스토리지 효율성', '압축', '데이터 보존 기간', 'TTL', '스토리지 최적화', '디스크 사용량']
show_related_blogs: true
doc_type: 'guide'
---

# 시계열 저장 효율성 \{#time-series-storage-efficiency\}

Wikipedia 통계 데이터셋에 대한 쿼리 방법을 살펴보았으니, 이제 ClickHouse에서 이 데이터셋의 저장 효율을 최적화하는 데 집중하겠습니다.
이 섹션에서는 쿼리 성능을 유지하면서 필요한 저장 용량을 줄이기 위한 실질적인 기법을 설명합니다.

## 타입 최적화 \{#time-series-type-optimization\}

스토리지 효율을 최적화하는 일반적인 방법은 최적의 데이터 타입을 사용하는 것입니다.
`project`와 `subproject` 컬럼을 예로 들어 보겠습니다. 이 컬럼들은 String 타입이지만, 고유 값의 개수는 상대적으로 적습니다:

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

이는 딕셔너리 기반 인코딩을 사용하는 `LowCardinality()` 데이터 타입을 사용할 수 있다는 뜻입니다. 이렇게 하면 ClickHouse는 원래 문자열 값 대신 내부 값 ID를 저장하므로, 그 결과로 상당한 저장 공간을 절약할 수 있습니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

또한 `hits` 컬럼에는 8바이트를 사용하지만 최대값은 비교적 작은 `UInt64` 타입을 사용했습니다.

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

이 값을 고려하면 4바이트만 사용하는 `UInt32`를 대신 사용할 수 있으며, 최대값을 약 40억까지 저장할 수 있습니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

이렇게 하면 메모리에서 이 컬럼의 크기가 최소 두 배 줄어듭니다. 디스크 상의 크기는 압축으로 인해 변하지 않는다는 점에 유의하십시오. 다만 데이터 타입을 너무 작게 선택하지 않도록 주의하십시오!

## 특수 코덱 \{#time-series-specialized-codecs\}

시계열과 같은 순차 데이터를 다룰 때는 특수 코덱을 사용하여 저장 효율을 더 향상할 수 있습니다.
기본 개념은 값 자체를 저장하는 대신 값들 사이의 변화를 저장하는 것으로, 이렇게 하면 변화가 느린 데이터를 저장할 때 필요한 공간을 훨씬 줄일 수 있습니다:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

`time` 컬럼에는 Delta 코덱을 사용했으며, 이는 시계열 데이터에 적합합니다.

적절한 정렬 키를 사용하면 디스크 공간도 절약할 수 있습니다.
일반적으로 `path`를 기준으로 필터링하므로 정렬 키에 `path`를 추가합니다.
이를 위해서는 테이블을 다시 생성해야 합니다.

아래에서 초기 테이블과 최적화된 테이블에 사용한 `CREATE` 명령을 확인할 수 있습니다.

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

이제 각 테이블별로 데이터가 차지하는 공간의 크기를 살펴보겠습니다.

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

최적화된 테이블은 압축된 상태에서 기존 대비 공간을 4배 조금 넘게 절약합니다.
