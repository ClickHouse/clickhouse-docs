---
title: '오픈 테이블 포맷에 데이터 쓰기'
sidebar_label: '데이터 레이크에 쓰기'
slug: /use-cases/data-lake/getting-started/writing-data
sidebar_position: 4
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/accelerating-analytics
pagination_next: null
description: '장기 보관 및 다운스트림 소비를 위해 ClickHouse에서 객체 스토리지의 Iceberg 테이블로 데이터를 다시 기록합니다.'
keywords: ['데이터 레이크', '레이크하우스', '쓰기', 'iceberg', '리버스 ETL', 'INSERT INTO', 'IcebergS3']
doc_type: 'guide'
---

이전 가이드에서는 오픈 테이블 포맷을 그대로 조회하고, 빠른 분석을 위해 데이터를 MergeTree로 적재했습니다. 많은 아키텍처에서는 데이터가 반대 방향, 즉 ClickHouse에서 다시 레이크하우스 포맷으로 흐를 필요도 있습니다. 이를 필요로 하는 대표적인 시나리오는 두 가지입니다.

- **장기 스토리지로 오프로딩** - 데이터는 실시간 분석 계층으로서 ClickHouse로 유입되어 대시보드 및 운영 리포팅을 지원합니다. 데이터가 실시간 분석 기간을 지나 노후화되면, 상호 운용 가능한 포맷으로 내구성과 비용 효율성이 높은 보존을 위해 객체 스토리지의 Iceberg로 데이터를 기록할 수 있습니다.
- **리버스 ETL** - ClickHouse 내부에서 수행되는 변환, 집계, 보강 작업은 다운스트림 도구 및 다른 팀에서 소비해야 하는 파생 데이터셋을 생성합니다. 이러한 결과를 Iceberg 테이블에 기록하면 더 넓은 데이터 생태계 전반에서 이를 사용할 수 있습니다.

두 경우 모두, `INSERT INTO SELECT`를 사용하여 ClickHouse 테이블의 데이터를 객체 스토리지에 저장된 Iceberg 테이블로 이동할 수 있습니다.

:::note
오픈 테이블 포맷으로 쓰기는 현재 **Iceberg 테이블에 한해서만** 지원됩니다. Delta Lake 테이블에 대한 부분적인 지원은 개발 중입니다. 테이블은 카탈로그에서 관리되는 테이블이어서는 안 됩니다.
:::

## 소스 데이터 세트 준비 \{#prepare-source\}

이 가이드에서는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid) 데이터 세트를 사용합니다. 이 데이터 세트는 영국의 잉글랜드와 웨일스에서 발생한 모든 주거용 부동산 거래에 대한 공개 기록입니다.

### MergeTree 테이블 생성 및 데이터 적재 \{#create-source-table\}

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

공개 CSV 소스에서 테이블에 직접 데이터를 채웁니다:

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;

30906560 rows in set. Elapsed: 59.852 sec. Processed 30.91 million rows, 5.41 GB (516.39 thousand rows/s., 90.40 MB/s.)
Peak memory usage: 485.15 MiB.
```


## Iceberg 테이블에 데이터 쓰기 \{#write-iceberg\}

### Iceberg 테이블 생성 \{#create-iceberg-table\}

데이터를 Iceberg에 저장하려면 [`IcebergS3` table engine](/engines/table-engines/integrations/iceberg)을 사용하여 테이블을 생성합니다.

스키마는 MergeTree 원본 테이블에 비해 단순화해야 합니다. ClickHouse는 Iceberg 및 그 기반이 되는 Parquet 파일보다 더 풍부한 타입 시스템을 지원하므로, `Enum`, `LowCardinality`, `UInt8`와 같은 타입은 Iceberg에서 지원되지 않으며 호환 가능한 타입으로 매핑해야 합니다.

```sql
CREATE TABLE uk.uk_iceberg
(
    price UInt32,
    date Date,
    postcode1 String,
    postcode2 String,
    type UInt32,
    is_new UInt32,
    duration UInt32,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_price_paid/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```


### 일부 데이터 삽입하기 \{#insert-subset\}

`INSERT INTO SELECT`를 사용하여 MergeTree 테이블의 데이터를 Iceberg 테이블에 적재합니다. 이 예시에서는 London 거래만 적재합니다.

```sql
SET allow_experimental_insert_into_iceberg = 1;

INSERT INTO uk.uk_iceberg SELECT *
FROM uk.uk_price_paid
WHERE town = 'LONDON'

2346741 rows in set. Elapsed: 1.419 sec. Processed 30.91 million rows, 153.43 MB (21.78 million rows/s., 108.15 MB/s.)
Peak memory usage: 371.60 MiB.
```


### Iceberg 테이블 쿼리하기 \{#query-iceberg\}

데이터는 이제 객체 스토리지에 Iceberg 형식으로 저장되며, ClickHouse 또는 Iceberg를 읽는 다른 도구에서 쿼리할 수 있습니다:

```sql
SELECT
    locality,
    count()
FROM uk.uk_iceberg
WHERE locality != ''
GROUP BY locality
ORDER BY count() DESC
LIMIT 10

┌─locality────┬─count()─┐
│ LONDON      │  896796 │
│ WALTHAMSTOW │    8610 │
│ LEYTON      │    3525 │
│ CHINGFORD   │    3133 │
│ HORNSEY     │    2794 │
│ STREATHAM   │    2760 │
│ WOOD GREEN  │    2443 │
│ ACTON       │    2155 │
│ LEYTONSTONE │    2102 │
│ EAST HAM    │    2085 │
└─────────────┴─────────┘

10 rows in set. Elapsed: 0.329 sec. Processed 457.86 thousand rows, 2.62 MB (1.39 million rows/s., 7.95 MB/s.)
Peak memory usage: 12.19 MiB.
```


## 집계 결과 쓰기 \{#write-aggregates\}

Iceberg 테이블은 원시 행만 저장하는 데 그치지 않습니다. 집계 및 변환 결과, 즉 ClickHouse 내부에서 수행되는 ETL 프로세스의 결과도 저장할 수 있습니다. 이는 사전 계산된 요약 결과를 레이크하우스(lakehouse)에 게시하여 이후 단계의 시스템에서 활용할 수 있게 하는 데 유용합니다.

### 집계용 Iceberg 테이블 생성 \{#create-aggregate-table\}

```sql
CREATE TABLE uk.uk_avg_town
(
    price Float64,
    town String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_avg_town/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```


### 집계된 데이터 삽입 \{#insert-aggregates\}

지역별 평균 부동산 가격을 계산하고 결과를 Iceberg에 직접 기록합니다:

```sql
INSERT INTO uk.uk_avg_town SELECT
    avg(price) AS price,
    town
FROM uk.uk_price_paid
GROUP BY town

1173 rows in set. Elapsed: 0.480 sec. Processed 30.91 million rows, 185.44 MB (64.34 million rows/s., 386.05 MB/s.)
Peak memory usage: 4.18 MiB.
```


### 집계된 테이블을 쿼리하기 \{#query-aggregates\}

이제 다른 도구 및 다른 ClickHouse 인스턴스에서도 이 사전 계산된 데이터 세트를 읽을 수 있습니다:

```sql
SELECT
    town,
    price
FROM uk.uk_avg_town
ORDER BY price DESC
LIMIT 10

┌─town───────────────┬──────────────price─┐
│ GATWICK            │ 28232811.583333332 │
│ THORNHILL          │             985000 │
│ VIRGINIA WATER     │  984633.2938574939 │
│ CHALFONT ST GILES  │  863347.7280187573 │
│ COBHAM             │    775251.47313278 │
│ PURFLEET-ON-THAMES │           772651.8 │
│ BEACONSFIELD       │  746052.9327405858 │
│ ESHER              │  686708.4969745865 │
│ KESTON             │  654541.1774842045 │
│ GERRARDS CROSS     │  639109.4084023251 │
└────────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.210 sec.
```
