---
sidebar_label: '무작위 테스트 데이터 생성'
title: 'ClickHouse에서 무작위 테스트 데이터 생성'
slug: /guides/generating-test-data
description: 'ClickHouse에서 무작위 테스트 데이터를 생성하는 방법을 알아봅니다'
show_related_blogs: true
doc_type: 'guide'
keywords: ['무작위 데이터', '테스트 데이터']
---

# ClickHouse에서 랜덤 테스트 데이터 생성하기 \{#generating-random-test-data-in-clickhouse\}

랜덤 데이터 생성은 새로운 사용 사례를 시험하거나 구현을 벤치마크할 때 유용합니다.
ClickHouse에는 많은 경우 외부 데이터 생성기가 필요 없을 정도로 [랜덤 데이터를 생성하기 위한 다양한 함수](/sql-reference/functions/random-functions)가 있습니다.

이 가이드는 무작위성 요구 사항이 서로 다른 랜덤 데이터세트를 ClickHouse에서 생성하는 여러 예제를 제공합니다.

## 간단한 균등 분포 데이터 세트 \{#simple-uniform-dataset\}

**사용 예**: 무작위 타임스탬프와 이벤트 유형을 가진 사용자 이벤트의 테스트용 데이터 세트를 빠르게 생성합니다.

```sql
CREATE TABLE user_events (
  event_id UUID,
  user_id UInt32,
  event_type LowCardinality(String),
  event_time DateTime
) ENGINE = MergeTree
ORDER BY event_time;

INSERT INTO user_events
SELECT
  generateUUIDv4() AS event_id,
  rand() % 10000 AS user_id,
  arrayJoin(['click','view','purchase']) AS event_type,
  now() - INTERVAL rand() % 3600*24 SECOND AS event_time
FROM numbers(1000000);
```

* `rand() % 10000`: 1만 명의 사용자에 대해 균등 분포
* `arrayJoin(...)`: 세 가지 이벤트 유형 중 하나를 무작위로 선택
* 지난 24시간에 걸쳐 분포된 타임스탬프

***

## 지수 분포 \{#exponential-distribution\}

**사용 사례**: 대부분의 값은 낮고 일부 값만 높은 구매 금액 분포를 시뮬레이션하는 데 사용합니다.

```sql
CREATE TABLE purchases (
  dt DateTime,
  customer_id UInt32,
  total_spent Float32
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO purchases
SELECT
  now() - INTERVAL randUniform(1,1_000_000) SECOND AS dt,
  number AS customer_id,
  15 + round(randExponential(1/10), 2) AS total_spent
FROM numbers(500000);
```

* 최근 기간에 걸쳐 고르게 분포된 타임스탬프
* `randExponential(1/10)` — 대부분의 합계가 0에 가깝고, 최소값을 15로 만들기 위해 15를 더해 오프셋합니다 ([ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4])

***

## 시간 분포 이벤트(Poisson) \{#poisson-distribution\}

**사용 사례**: 특정 시간대(예: 피크 시간대) 주변에 집중적으로 도착하는 이벤트를 시뮬레이션합니다.

```sql
CREATE TABLE events (
  dt DateTime,
  event_type String
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO events
SELECT
  toDateTime('2022-12-12 12:00:00')
    - ((12 + randPoisson(12)) * 3600) AS dt,
  'click' AS event_type
FROM numbers(200000);
```

* 이벤트 발생은 정오 무렵에 가장 많고, 편차는 포아송 분포를 따릅니다

***

## 시간에 따라 변하는 정규 분포 \{#time-varying-normal-distribution\}

**사용 예**: 시간에 따라 변하는 시스템 메트릭(예: CPU 사용량)을 모사할 때 사용합니다.

```sql
CREATE TABLE cpu_metrics (
  host String,
  ts DateTime,
  usage Float32
) ENGINE = MergeTree
ORDER BY (host, ts);

INSERT INTO cpu_metrics
SELECT
  arrayJoin(['host1','host2','host3']) AS host,
  now() - INTERVAL number SECOND AS ts,
  greatest(0.0, least(100.0,
    randNormal(50 + 30*sin(toUInt32(ts)%86400/86400*2*pi()), 10)
  )) AS usage
FROM numbers(10000);
```

* `usage`는 하루 주기의 사인파에 랜덤성이 더해진 값을 따릅니다
* 값은 [0,100] 범위로 제한됩니다

***

## 범주형 및 중첩 데이터 \{#categorical-and-nested-data\}

**사용 사례**: 복수 개의 관심사를 가진 사용자 프로필을 생성합니다.

```sql
CREATE TABLE user_profiles (
  user_id UInt32,
  interests Array(String),
  scores Array(UInt8)
) ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO user_profiles
SELECT
  number AS user_id,
  arrayShuffle(['sports','music','tech'])[1 + rand() % 3 : 1 + rand() % 3] AS interests,
  [rand() % 100, rand() % 100, rand() % 100] AS scores
FROM numbers(20000);
```

* 1–3 사이의 임의의 배열 길이
* 각 관심사별 사용자당 점수 3개

:::tip
더 많은 예제를 보려면 [Generating Random Data in ClickHouse](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse) 블로그를 참고하십시오.
:::

## 랜덤 테이블 생성하기 \{#generating-random-tables\}

[`generateRandomStructure`](/sql-reference/functions/other-functions#generateRandomStructure) 함수는 테스트, 벤치마킹 또는 임의 스키마를 갖는 목업 데이터 생성을 위해 [`generateRandom`](/sql-reference/table-functions/generate) 테이블 엔진과 함께 사용할 때 특히 유용합니다.

`generateRandomStructure` 함수를 사용하여 무작위 구조가 어떤 모습인지부터 살펴보겠습니다:

```sql
SELECT generateRandomStructure(5);
```

다음과 같은 결과가 표시될 수 있습니다:

```response
c1 UInt32, c2 Array(String), c3 DateTime, c4 Nullable(Float64), c5 Map(String, Int16)
```

시드(seed)를 사용하면 매번 동일한 구조를 생성할 수도 있습니다:

```sql
SELECT generateRandomStructure(3, 42);
```

```response
c1 String, c2 Array(Nullable(Int32)), c3 Tuple(UInt8, Date)
```

이제 실제 테이블을 생성하고 임의의 데이터로 채워 보겠습니다:

```sql
CREATE TABLE my_test_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT * 
FROM generateRandom(
    'col1 UInt32, col2 String, col3 Float64, col4 DateTime',
    1,  -- seed for data generation
    10  -- number of different random values
)
LIMIT 100;  -- 100 rows

-- Step 2: Query your new table
SELECT * FROM my_test_table LIMIT 5;
```

```response
┌───────col1─┬─col2──────┬─────────────────────col3─┬────────────────col4─┐
│ 4107652264 │ &b!M-e;7  │  1.0013455832230728e-158 │ 2059-08-14 19:03:26 │
│  652895061 │ Dj7peUH{T │   -1.032074207667996e112 │ 2079-10-06 04:18:16 │
│ 2319105779 │ =D[       │    -2.066555415720528e88 │ 2015-04-26 11:44:13 │
│ 1835960063 │ _@}a      │  -1.4998020545039013e110 │ 2063-03-03 20:36:55 │
│  730412674 │ _}!       │ -1.3578492992094465e-275 │ 2098-08-23 18:23:37 │
└────────────┴───────────┴──────────────────────────┴─────────────────────┘
```

두 FUNCTION을 함께 사용하여 완전히 랜덤한 테이블을 만들어 보겠습니다.
먼저 어떤 구조가 생성되는지 확인하십시오:

```sql
SELECT generateRandomStructure(7, 123) AS structure FORMAT vertical;
```

```response
┌─structure──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal64(7), c2 Enum16('c2V0' = -21744, 'c2V1' = 5380), c3 Int8, c4 UUID, c5 UUID, c6 FixedString(190), c7 Map(Enum16('c7V0' = -19581, 'c7V1' = -10024, 'c7V2' = 27615, 'c7V3' = -10177, 'c7V4' = -19644, 'c7V5' = 3554, 'c7V6' = 29073, 'c7V7' = 28800, 'c7V8' = -11512), Float64) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

이제 해당 구조로 테이블을 생성한 뒤, `DESCRIBE` 문을 사용하여 무엇을 생성했는지 확인합니다:

```sql
CREATE TABLE fully_random_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT * 
FROM generateRandom(generateRandomStructure(7, 123), 1, 10)
LIMIT 1000;

DESCRIBE TABLE fully_random_table;
```

```response
   ┌─name─┬─type─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
1. │ c1   │ Decimal(18, 7)                                                                                                                                                           │              │                    │         │                  │                │
2. │ c2   │ Enum16('c2V0' = -21744, 'c2V1' = 5380)                                                                                                                                   │              │                    │         │                  │                │
3. │ c3   │ Int8                                                                                                                                                                     │              │                    │         │                  │                │
4. │ c4   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
5. │ c5   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
6. │ c6   │ FixedString(190)                                                                                                                                                         │              │                    │         │                  │                │
7. │ c7   │ Map(Enum16('c7V4' = -19644, 'c7V0' = -19581, 'c7V8' = -11512, 'c7V3' = -10177, 'c7V1' = -10024, 'c7V5' = 3554, 'c7V2' = 27615, 'c7V7' = 28800, 'c7V6' = 29073), Float64) │              │                    │         │                  │                │
   └──────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

생성된 데이터의 샘플을 확인하려면 첫 번째 행을 살펴보십시오:

```sql
SELECT * FROM fully_random_table LIMIT 1 FORMAT vertical;
```

```response
Row 1:
──────
c1: 80416293882.257732 -- 80.42 billion
c2: c2V1
c3: -84
c4: 1a9429b3-fd8b-1d72-502f-c051aeb7018e
c5: 7407421a-031f-eb3b-8571-44ff279ddd36
c6: g̅b�&��rҵ���5C�\�|��H�>���l'V3��R�[��=3�G�LwVMR*s緾/2�J.���6#��(�h>�lە��L^�M�:�R�9%d�ž�zv��W����Y�S��_no��BP+��u��.0��UZ!x�@7:�nj%3�Λd�S�k>���w��|�&��~
c7: {'c7V8':-1.160941256852442}
```
