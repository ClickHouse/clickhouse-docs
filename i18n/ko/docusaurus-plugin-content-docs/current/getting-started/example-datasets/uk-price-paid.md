---
'description': '영국 부동산 데이터셋을 사용하여 자주 실행하는 쿼리의 성능을 향상시키기 위해 프로젝션을 사용하는 방법을 배워보세요. 이
  데이터셋은 잉글랜드와 웨일스의 부동산에 대해 지불된 가격에 대한 데이터를 포함하고 있습니다.'
'sidebar_label': '영국 부동산 가격'
'slug': '/getting-started/example-datasets/uk-price-paid'
'title': '영국 부동산 가격 데이터셋'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'uk property'
- 'sample data'
- 'real estate'
- 'getting started'
---

이 데이터는 잉글랜드와 웨일즈의 부동산에 대해 지불된 가격을 포함하고 있습니다. 데이터는 1995년부터 사용 가능하며, 압축되지 않은 형태의 데이터셋 크기는 약 4 GiB(ClickHouse에서는 약 278 MiB만 차지합니다).

- 출처: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 필드 설명: https://www.gov.uk/guidance/about-the-price-paid-data
- HM 토지 등록부 데이터 포함 © Crown copyright 및 데이터베이스 권리 2021. 이 데이터는 Open Government Licence v3.0에 따라 라이센스가 부여됩니다.

## 테이블 생성 {#create-table}

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

## 데이터 전처리 및 삽입 {#preprocess-import-data}

`url` 함수를 사용하여 데이터를 ClickHouse로 스트리밍할 것입니다. 먼저 일부 수신 데이터에 대해 전처리를 해야 합니다. 이에는 다음이 포함됩니다:
- `postcode`를 두 개의 다른 컬럼인 `postcode1`과 `postcode2`로 분리합니다. 이렇게 하면 저장 및 쿼리가 더 용이합니다.
- `time` 필드를 날짜로 변환합니다. 이 필드는 00:00 시간만 포함하고 있습니다.
- 분석에 필요하지 않기 때문에 [UUid](../../sql-reference/data-types/uuid.md) 필드를 무시합니다.
- [transform](../../sql-reference/functions/other-functions.md#transform) 함수를 사용하여 `type`과 `duration`을 더 읽기 쉬운 `Enum` 필드로 변환합니다.
- `is_new` 필드를 단일 문자 문자열(`Y`/`N`)에서 0 또는 1의 [UInt8](/sql-reference/data-types/int-uint) 필드로 변환합니다.
- 마지막 두 컬럼은 모두 같은 값(즉 0)을 가지므로 삭제합니다.

`url` 함수는 웹 서버에서 ClickHouse 테이블로 데이터를 스트리밍합니다. 다음 명령은 `uk_price_paid` 테이블에 500만 행을 삽입합니다:

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

데이터가 삽입될 때까지 기다리세요. 네트워크 속도에 따라 1~2분 정도 소요됩니다.

## 데이터 검증 {#validate-data}

삽입된 행 수를 확인하여 작업이 성공했는지 확인해 보겠습니다:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

이 쿼리를 실행할 당시 데이터셋에는 27,450,499행이 있었습니다. ClickHouse에서 테이블의 저장 크기가 얼마인지 확인해 봅시다:

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

테이블 크기는 단지 221.43 MiB입니다!

## 쿼리 실행 {#run-queries}

데이터를 분석하기 위해 몇 가지 쿼리를 실행해 보겠습니다:

### 쿼리 1. 연도별 평균 가격 {#average-price}

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

### 쿼리 2. 런던의 연도별 평균 가격 {#average-price-london}

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

2020년에는 주택 가격에 무언가가 발생했습니다! 하지만 그다지 놀라운 일은 아닐 것입니다...

### 쿼리 3. 가장 비싼 동네 {#most-expensive-neighborhoods}

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

## 프로젝션으로 쿼리 속도 높이기 {#speeding-up-queries-with-projections}

프로젝션을 통해 이러한 쿼리의 속도를 높일 수 있습니다. 이 데이터셋을 사용한 예시를 보려면 ["Projections"](/data-modeling/projections)를 참조하십시오.

### 플레이그라운드에서 테스트 {#playground}

데이터셋은 [온라인 플레이그라운드](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)에서도 사용 가능합니다.
