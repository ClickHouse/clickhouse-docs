---
description: '잉글랜드와 웨일스의 부동산(real-estate) 거래 가격 데이터가 포함된 UK property 데이터셋을 사용하여, 자주 실행하는 쿼리의 성능을 프로젝션(projections)으로 향상시키는 방법을 학습합니다'
sidebar_label: 'UK 부동산 가격'
slug: /getting-started/example-datasets/uk-price-paid
title: 'UK 부동산 가격 데이터셋'
doc_type: 'guide'
keywords: ['example dataset', 'uk property', 'sample data', 'real estate', 'getting started']
---

이 데이터에는 잉글랜드와 웨일스에서 거래된 부동산(real-estate) 가격 정보가 포함되어 있습니다. 데이터는 1995년부터 제공되며, 비압축 형태에서 데이터셋의 크기는 약 4 GiB이고 ClickHouse에서는 약 278 MiB만 차지합니다.

- 출처: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 필드 설명: https://www.gov.uk/guidance/about-the-price-paid-data
- HM Land Registry 데이터가 포함되어 있으며, © Crown copyright and database right 2021. 이 데이터는 Open Government Licence v3.0에 따라 라이선스가 적용됩니다.

## 테이블 생성 \{#create-table\}

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


## 데이터 전처리 및 삽입 \{#preprocess-import-data\}

`url` 함수를 사용하여 데이터를 ClickHouse로 스트리밍합니다. 먼저 일부 입력 데이터를 전처리해야 하며, 여기에는 다음 작업이 포함됩니다.

* `postcode`를 `postcode1`과 `postcode2`라는 두 개의 별도 컬럼으로 분리하여 저장 및 쿼리에 더 적합하도록 합니다.
* `time` 필드는 00:00 시각만 포함하므로 날짜로 변환합니다.
* 분석에 필요하지 않으므로 [UUid](../../sql-reference/data-types/uuid.md) 필드는 무시합니다.
* [transform](../../sql-reference/functions/other-functions.md#transform) 함수를 사용하여 `type` 및 `duration`을 더 읽기 쉬운 `Enum` 필드로 변환합니다.
* 단일 문자 문자열(`Y`/`N`)인 `is_new` 필드를 0 또는 1 값을 갖는 [UInt8](/sql-reference/data-types/int-uint) 필드로 변환합니다.
* 마지막 두 컬럼은 모두 동일한 값(0)을 가지므로 제거합니다.

`url` 함수는 웹 서버에서 ClickHouse 테이블로 데이터를 스트리밍합니다. 다음 명령은 `uk_price_paid` 테이블에 500만 행을 삽입합니다.

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
```

데이터 삽입이 완료될 때까지 기다리십시오. 네트워크 속도에 따라 1~2분 정도 소요될 수 있습니다.


## 데이터 검증 \{#validate-data\}

얼마나 많은 행이 삽입되었는지 확인하여 정상적으로 동작했는지 검증해 보겠습니다:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

이 쿼리를 실행할 당시 데이터셋에는 27,450,499개의 행이 있었습니다. 이제 ClickHouse에서 이 테이블이 차지하는 저장 용량이 어느 정도인지 확인해 보겠습니다.

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

테이블 크기는 겨우 221.43 MiB입니다!


## 몇 가지 쿼리 실행하기 \{#run-queries\}

데이터를 분석하기 위해 몇 가지 쿼리를 실행해 보겠습니다.

### 쿼리 1. 연도별 평균 가격 \{#average-price\}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80
)
FROM uk.uk_price_paid
GROUP BY year
ORDER BY year
```


### 쿼리 2. 런던의 연도별 평균 가격 \{#average-price-london\}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100
)
FROM uk.uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

2020년에 주택 가격에 큰 변화가 있었습니다! 하지만 아마 그다지 놀라운 일은 아닐 것입니다...


### 쿼리 3. 가장 비싼 동네 \{#most-expensive-neighborhoods\}

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```


## 프로젝션으로 쿼리 가속화하기 \{#speeding-up-queries-with-projections\}

프로젝션을 사용하면 이러한 쿼리를 더 빠르게 실행할 수 있습니다. 이 데이터세트를 사용한 예시는 ["Projections"](/data-modeling/projections)를 참고하십시오.

### 플레이그라운드에서 테스트하기 \{#playground\}

이 데이터셋은 [Online Playground](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)에서 바로 사용해 볼 수 있습니다.