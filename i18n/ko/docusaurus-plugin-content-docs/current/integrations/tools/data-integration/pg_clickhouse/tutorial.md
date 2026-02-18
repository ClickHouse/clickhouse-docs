---
sidebar_label: '튜토리얼'
description: 'pg_clickhouse를 ClickHouse에 연결하고 뉴욕시 택시 예제 데이터셋을 쿼리하는 방법을 알아봅니다.'
slug: '/integrations/pg_clickhouse/tutorial'
title: 'pg_clickhouse 튜토리얼'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension', 'tutorial', 'taxi']
---

# pg_clickhouse 튜토리얼 \{#pg_clickhouse-tutorial\}

## 개요 \{#overview\}

이 튜토리얼은 [ClickHouse 튜토리얼]을 기반으로 하되, 모든 쿼리는 pg_clickhouse를 통해 실행합니다.

## ClickHouse 시작하기 \{#start-clickhouse\}

먼저 ClickHouse 데이터베이스가 없다면 생성합니다. 빠르게 시작하려면
Docker 이미지를 사용하는 것이 좋습니다:

```sh
docker run -d --network host --name clickhouse -p 8123:8123 -p9000:9000 --ulimit nofile=262144:262144 clickhouse
docker exec -it clickhouse clickhouse-client
```


## 테이블 생성하기 \{#create-a-table\}

[ClickHouse tutorial]을 참고하여 뉴욕시 택시 데이터셋으로 간단한 데이터베이스를 만들어 보겠습니다:

```sql
CREATE DATABASE taxi;
CREATE TABLE taxi.trips
(
    trip_id UInt32,
    vendor_id Enum8(
        '1'      =  1, '2'      =  2, '3'      =  3, '4'      =  4,
        'CMT'    =  5, 'VTS'    =  6, 'DDS'    =  7, 'B02512' = 10,
        'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14,
        ''       = 15
    ),
    pickup_date Date,
    pickup_datetime DateTime,
    dropoff_date Date,
    dropoff_datetime DateTime,
    store_and_fwd_flag UInt8,
    rate_code_id UInt8,
    pickup_longitude Float64,
    pickup_latitude Float64,
    dropoff_longitude Float64,
    dropoff_latitude Float64,
    passenger_count UInt8,
    trip_distance Float64,
    fare_amount Decimal(10, 2),
    extra Decimal(10, 2),
    mta_tax Decimal(10, 2),
    tip_amount Decimal(10, 2),
    tolls_amount Decimal(10, 2),
    ehail_fee Decimal(10, 2),
    improvement_surcharge Decimal(10, 2),
    total_amount Decimal(10, 2),
    payment_type Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    trip_type UInt8,
    pickup FixedString(25),
    dropoff FixedString(25),
    cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    pickup_nyct2010_gid Int8,
    pickup_ctlabel Float32,
    pickup_borocode Int8,
    pickup_ct2010 String,
    pickup_boroct2010 String,
    pickup_cdeligibil String,
    pickup_ntacode FixedString(4),
    pickup_ntaname String,
    pickup_puma UInt16,
    dropoff_nyct2010_gid UInt8,
    dropoff_ctlabel Float32,
    dropoff_borocode UInt8,
    dropoff_ct2010 String,
    dropoff_boroct2010 String,
    dropoff_cdeligibil String,
    dropoff_ntacode FixedString(4),
    dropoff_ntaname String,
    dropoff_puma UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime;
```


## 데이터 Set 추가 \{#add-the-data-set\}

그다음 데이터를 가져옵니다:

```sql
INSERT INTO taxi.trips
SELECT * FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
    'TabSeparatedWithNames', "
    trip_id UInt32,
    vendor_id Enum8(
        '1'      =  1, '2'      =  2, '3'      =  3, '4'      =  4,
        'CMT'    =  5, 'VTS'    =  6, 'DDS'    =  7, 'B02512' = 10,
        'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14,
        ''       = 15
    ),
    pickup_date Date,
    pickup_datetime DateTime,
    dropoff_date Date,
    dropoff_datetime DateTime,
    store_and_fwd_flag UInt8,
    rate_code_id UInt8,
    pickup_longitude Float64,
    pickup_latitude Float64,
    dropoff_longitude Float64,
    dropoff_latitude Float64,
    passenger_count UInt8,
    trip_distance Float64,
    fare_amount Decimal(10, 2),
    extra Decimal(10, 2),
    mta_tax Decimal(10, 2),
    tip_amount Decimal(10, 2),
    tolls_amount Decimal(10, 2),
    ehail_fee Decimal(10, 2),
    improvement_surcharge Decimal(10, 2),
    total_amount Decimal(10, 2),
    payment_type Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    trip_type UInt8,
    pickup FixedString(25),
    dropoff FixedString(25),
    cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    pickup_nyct2010_gid Int8,
    pickup_ctlabel Float32,
    pickup_borocode Int8,
    pickup_ct2010 String,
    pickup_boroct2010 String,
    pickup_cdeligibil String,
    pickup_ntacode FixedString(4),
    pickup_ntaname String,
    pickup_puma UInt16,
    dropoff_nyct2010_gid UInt8,
    dropoff_ctlabel Float32,
    dropoff_borocode UInt8,
    dropoff_ct2010 String,
    dropoff_boroct2010 String,
    dropoff_cdeligibil String,
    dropoff_ntacode FixedString(4),
    dropoff_ntaname String,
    dropoff_puma UInt16
") SETTINGS input_format_try_infer_datetimes = 0
```

쿼리를 실행할 수 있는지 확인한 다음 클라이언트를 종료하십시오:

```sql
SELECT count() FROM taxi.trips;
quit
```


### pg_clickhouse 설치 \{#install-pg_clickhouse\}

[PGXN] 또는 [GitHub]에서 pg&#95;clickhouse를 빌드하고 설치합니다. 또는 [pg&#95;clickhouse image]를 사용하여 Docker 컨테이너를 실행할 수 있습니다. 이 이미지는 Docker [Postgres image]에 pg&#95;clickhouse만 단순히 추가한 것입니다.

```sh
docker run -d --network host --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
```


### pg_clickhouse 연결 \{#connect-pg_clickhouse\}

이제 Postgres에 연결하십시오:

```sh
docker exec -it pg_clickhouse psql -U postgres
```

그리고 pg&#95;clickhouse를 생성합니다:

```sql
CREATE EXTENSION pg_clickhouse;
```

ClickHouse 데이터베이스의 호스트 이름, 포트, 데이터베이스 이름을 사용하여 foreign server를 생성합니다.

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

여기서는 ClickHouse 바이너리 프로토콜을 사용하는 binary 드라이버를 선택했습니다. HTTP 인터페이스를 사용하는 &quot;http&quot; 드라이버를 사용할 수도 있습니다.

다음으로 PostgreSQL 사용자와 ClickHouse 사용자를 매핑합니다. 가장 간단한 방법은 현재 PostgreSQL 사용자를 외부 서버의 원격 사용자에 그대로 매핑하는 것입니다:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
```

`password` 옵션도 지정할 수 있습니다.

이제 taxi 테이블을 추가합니다. 이를 위해 원격 ClickHouse 데이터베이스에 있는 모든 테이블을 Postgres 스키마로 가져오십시오.

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```

이제 테이블이 가져와졌을 것입니다. [psql]에서 `\det+`를 사용하여 확인하십시오:

```pgsql
taxi=# \det+ taxi.*
                                       List of foreign tables
 Schema | Table |  Server  |                        FDW options                        | Description
--------+-------+----------+-----------------------------------------------------------+-------------
 taxi   | trips | taxi_srv | (database 'taxi', table_name 'trips', engine 'MergeTree') | [null]
(1 row)
```

성공했습니다! 모든 컬럼을 보려면 `\d`를 사용하십시오:


```pgsql
taxi=# \d taxi.trips
                                     Foreign table "taxi.trips"
        Column         |            Type             | Collation | Nullable | Default | FDW options
-----------------------+-----------------------------+-----------+----------+---------+-------------
 trip_id               | bigint                      |           | not null |         |
 vendor_id             | text                        |           | not null |         |
 pickup_date           | date                        |           | not null |         |
 pickup_datetime       | timestamp without time zone |           | not null |         |
 dropoff_date          | date                        |           | not null |         |
 dropoff_datetime      | timestamp without time zone |           | not null |         |
 store_and_fwd_flag    | smallint                    |           | not null |         |
 rate_code_id          | smallint                    |           | not null |         |
 pickup_longitude      | double precision            |           | not null |         |
 pickup_latitude       | double precision            |           | not null |         |
 dropoff_longitude     | double precision            |           | not null |         |
 dropoff_latitude      | double precision            |           | not null |         |
 passenger_count       | smallint                    |           | not null |         |
 trip_distance         | double precision            |           | not null |         |
 fare_amount           | numeric(10,2)               |           | not null |         |
 extra                 | numeric(10,2)               |           | not null |         |
 mta_tax               | numeric(10,2)               |           | not null |         |
 tip_amount            | numeric(10,2)               |           | not null |         |
 tolls_amount          | numeric(10,2)               |           | not null |         |
 ehail_fee             | numeric(10,2)               |           | not null |         |
 improvement_surcharge | numeric(10,2)               |           | not null |         |
 total_amount          | numeric(10,2)               |           | not null |         |
 payment_type          | text                        |           | not null |         |
 trip_type             | smallint                    |           | not null |         |
 pickup                | character varying(25)       |           | not null |         |
 dropoff               | character varying(25)       |           | not null |         |
 cab_type              | text                        |           | not null |         |
 pickup_nyct2010_gid   | smallint                    |           | not null |         |
 pickup_ctlabel        | real                        |           | not null |         |
 pickup_borocode       | smallint                    |           | not null |         |
 pickup_ct2010         | text                        |           | not null |         |
 pickup_boroct2010     | text                        |           | not null |         |
 pickup_cdeligibil     | text                        |           | not null |         |
 pickup_ntacode        | character varying(4)        |           | not null |         |
 pickup_ntaname        | text                        |           | not null |         |
 pickup_puma           | integer                     |           | not null |         |
 dropoff_nyct2010_gid  | smallint                    |           | not null |         |
 dropoff_ctlabel       | real                        |           | not null |         |
 dropoff_borocode      | smallint                    |           | not null |         |
 dropoff_ct2010        | text                        |           | not null |         |
 dropoff_boroct2010    | text                        |           | not null |         |
 dropoff_cdeligibil    | text                        |           | not null |         |
 dropoff_ntacode       | character varying(4)        |           | not null |         |
 dropoff_ntaname       | text                        |           | not null |         |
 dropoff_puma          | integer                     |           | not null |         |
Server: taxi_srv
FDW options: (database 'taxi', table_name 'trips', engine 'MergeTree')
```

이제 테이블에 쿼리를 실행하십시오:

```pgsql
 SELECT count(*) FROM taxi.trips;
   count
 ---------
  1999657
 (1 row)
```

쿼리가 얼마나 빠르게 실행되었는지에 주목하십시오. pg&#95;clickhouse는 `COUNT()` 집계를 포함한 전체
쿼리를 ClickHouse로 푸시다운하여 ClickHouse에서 실행한 뒤 단일 행만 Postgres로
반환합니다. [EXPLAIN]을 사용하여 이를 확인하십시오.

```pgsql
 EXPLAIN select count(*) from taxi.trips;
                    QUERY PLAN
 -------------------------------------------------
  Foreign Scan  (cost=1.00..-0.90 rows=1 width=8)
    Relations: Aggregate on (trips)
 (2 rows)
```

실행 계획의 루트에 「Foreign Scan」이 나타난 것은
전체 쿼리가 ClickHouse로 푸시다운되었음을 의미합니다.


## 데이터 분석 \{#analyze-the-data\}

데이터를 분석하기 위해 몇 가지 쿼리를 실행하십시오. 다음 예시를 살펴보거나
직접 SQL 쿼리를 실행해 보십시오.

* 평균 팁 금액을 계산하십시오:

  ```sql
  taxi=# \timing
  Timing is on.
  taxi=# SELECT round(avg(tip_amount), 2) FROM taxi.trips;
   round
  -------
    1.68
  (1 row)

  Time: 9.438 ms
  ```

* 승객 수를 기준으로 평균 요금을 계산합니다:

  ```pgsql
  taxi=# SELECT
          passenger_count,
          avg(total_amount)::NUMERIC(10, 2) AS average_total_amount
      FROM taxi.trips
      GROUP BY passenger_count;
   passenger_count | average_total_amount
  -----------------+----------------------
                 0 |                22.68
                 1 |                15.96
                 2 |                17.14
                 3 |                16.75
                 4 |                17.32
                 5 |                16.34
                 6 |                16.03
                 7 |                59.79
                 8 |                36.40
                 9 |                 9.79
  (10 rows)

  Time: 27.266 ms
  ```

* 지역별 일별 픽업 건수를 계산합니다:

  ```pgsql
  taxi=# SELECT
      pickup_date,
      pickup_ntaname,
      SUM(1) AS number_of_trips
  FROM taxi.trips
  GROUP BY pickup_date, pickup_ntaname
  ORDER BY pickup_date ASC LIMIT 10;
   pickup_date |         pickup_ntaname         | number_of_trips
  -------------+--------------------------------+-----------------
   2015-07-01  | Williamsburg                   |               1
   2015-07-01  | park-cemetery-etc-Queens       |               6
   2015-07-01  | Maspeth                        |               1
   2015-07-01  | Stuyvesant Town-Cooper Village |              44
   2015-07-01  | Rego Park                      |               1
   2015-07-01  | Greenpoint                     |               7
   2015-07-01  | Highbridge                     |               1
   2015-07-01  | Briarwood-Jamaica Hills        |               3
   2015-07-01  | Airport                        |             550
   2015-07-01  | East Harlem North              |              32
  (10 rows)

  Time: 30.978 ms
  ```

* 각 운행의 소요 시간을 분 단위로 계산한 다음, 소요 시간별로 결과를 그룹화합니다:

  ```pgsql
  taxi=# SELECT
      avg(tip_amount) AS avg_tip,
      avg(fare_amount) AS avg_fare,
      avg(passenger_count) AS avg_passenger,
      count(*) AS count,
      round((date_part('epoch', dropoff_datetime) - date_part('epoch', pickup_datetime)) / 60) as trip_minutes
  FROM taxi.trips
  WHERE round((date_part('epoch', dropoff_datetime) - date_part('epoch', pickup_datetime)) / 60) > 0
  GROUP BY trip_minutes
  ORDER BY trip_minutes DESC
  LIMIT 5;
        avg_tip      |     avg_fare     |  avg_passenger   | count | trip_minutes
  -------------------+------------------+------------------+-------+--------------
                1.96 |                8 |                1 |     1 |        27512
                   0 |               12 |                2 |     1 |        27500
   0.562727272727273 | 17.4545454545455 | 2.45454545454545 |    11 |         1440
   0.716564885496183 | 14.2786259541985 | 1.94656488549618 |   131 |         1439
    1.00945205479452 | 12.8787671232877 | 1.98630136986301 |   146 |         1438
  (5 rows)

  Time: 45.477 ms
  ```

* 각 동네별로 하루 중 시(hour) 단위로 나눈 픽업 횟수를 표시합니다:

  ```pgsql
  taxi=# SELECT
      pickup_ntaname,
      date_part('hour', pickup_datetime) as pickup_hour,
      SUM(1) AS pickups
  FROM taxi.trips
  WHERE pickup_ntaname != ''
  GROUP BY pickup_ntaname, pickup_hour
  ORDER BY pickup_ntaname, date_part('hour', pickup_datetime)
  LIMIT 5;
   pickup_ntaname | pickup_hour | pickups
  ----------------+-------------+---------
   Airport        |           0 |    3509
   Airport        |           1 |    1184
   Airport        |           2 |     401
   Airport        |           3 |     152
   Airport        |           4 |     213
  (5 rows)

  Time: 36.895 ms
  ```

* LaGuardia 또는 JFK 공항행 택시 운행을 조회합니다:

  ```pgsql
  taxi=# SELECT
      pickup_datetime,
      dropoff_datetime,
      total_amount,
      pickup_nyct2010_gid,
      dropoff_nyct2010_gid,
      CASE
          WHEN dropoff_nyct2010_gid = 138 THEN 'LGA'
          WHEN dropoff_nyct2010_gid = 132 THEN 'JFK'
      END AS airport_code,
      EXTRACT(YEAR FROM pickup_datetime) AS year,
      EXTRACT(DAY FROM pickup_datetime) AS day,
      EXTRACT(HOUR FROM pickup_datetime) AS hour
  FROM taxi.trips
  WHERE dropoff_nyct2010_gid IN (132, 138)
  ORDER BY pickup_datetime
  LIMIT 5;
     pickup_datetime   |  dropoff_datetime   | total_amount | pickup_nyct2010_gid | dropoff_nyct2010_gid | airport_code | year | day | hour
  ---------------------+---------------------+--------------+---------------------+----------------------+--------------+------+-----+------
   2015-07-01 00:04:14 | 2015-07-01 00:15:29 |        13.30 |                 -34 |                  132 | JFK          | 2015 |   1 |    0
   2015-07-01 00:09:42 | 2015-07-01 00:12:55 |         6.80 |                  50 |                  138 | LGA          | 2015 |   1 |    0
   2015-07-01 00:23:04 | 2015-07-01 00:24:39 |         4.80 |                -125 |                  132 | JFK          | 2015 |   1 |    0
   2015-07-01 00:27:51 | 2015-07-01 00:39:02 |        14.72 |                -101 |                  138 | LGA          | 2015 |   1 |    0
   2015-07-01 00:32:03 | 2015-07-01 00:55:39 |        39.34 |                  48 |                  138 | LGA          | 2015 |   1 |    0
  (5 rows)

  Time: 17.450 ms
  ```

## 딕셔너리(Dictionary) 생성 \{#create-a-dictionary\}

ClickHouse 서비스의 테이블과 연관된 딕셔너리를 생성합니다.  
이 테이블과 딕셔너리는 뉴욕시 각 동네별로 한 행씩을 포함하는 CSV 파일을 기반으로 합니다.

각 동네는 뉴욕시 5개 자치구(Bronx, Brooklyn, Manhattan, Queens, Staten Island)와 Newark Airport(EWR)에 매핑됩니다.

아래는 사용하는 CSV 파일의 일부를 테이블 형식으로 나타낸 것입니다.  
파일의 `LocationID` 컬럼은 trips 테이블의 `pickup_nyct2010_gid` 및
`dropoff_nyct2010_gid` 컬럼에 매핑됩니다:

| LocationID | Borough       |  Zone                   | service_zone |
  | ---------: | ------------- | ----------------------- | ------------ |
  |          1 | EWR           | Newark Airport          | EWR          |
  |          2 | Queens        | Jamaica Bay             | Boro Zone    |
  |          3 | Bronx         | Allerton/Pelham Gardens | Boro Zone    |
  |          4 | Manhattan     | Alphabet City           | Yellow Zone  |
  |          5 | Staten Island | Arden Heights           | Boro Zone    |

1.  Postgres에서 계속해서 `clickhouse_raw_query` 함수를 사용하여
    ClickHouse [dictionary] `taxi_zone_dictionary`를 생성하고,
    S3에 있는 CSV 파일에서 딕셔너리를 채웁니다:

    ```sql
    SELECT clickhouse_raw_query($$
        CREATE DICTIONARY taxi.taxi_zone_dictionary (
            LocationID Int64 DEFAULT 0,
            Borough String,
            zone String,
            service_zone String
        )
        PRIMARY KEY LocationID
        SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
        LIFETIME(MIN 0 MAX 0)
        LAYOUT(HASHED_ARRAY())
    $$, 'host=localhost dbname=taxi');
    ```

    :::note
    `LIFETIME`을 0으로 설정하면 자동 업데이트가 비활성화되어
    S3 버킷으로의 불필요한 트래픽을 방지합니다.  
    다른 상황에서는 이 값을 다르게 구성할 수 있습니다. 자세한 내용은
    [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)을
    참고하십시오.
    :::

    2.  이제 이를 가져옵니다:

    ```sql
    IMPORT FOREIGN SCHEMA taxi LIMIT TO (taxi_zone_dictionary)
    FROM SERVER taxi_srv INTO taxi;
    ```

    3.  쿼리할 수 있는지 확인합니다:

    ```pgsql
    taxi=# SELECT * FROM taxi.taxi_zone_dictionary limit 3;
     LocationID |  Borough  |                     Zone                      | service_zone
    ------------+-----------+-----------------------------------------------+--------------
             77 | Brooklyn  | East New York/Pennsylvania Avenue             | Boro Zone
            106 | Brooklyn  | Gowanus                                       | Boro Zone
            103 | Manhattan | Governor's Island/Ellis Island/Liberty Island | Yellow Zone
    (3 rows)
    ```

    4.  이제 `dictGet` 함수를 사용하여 쿼리에서 자치구 이름을
        가져옵니다. 이 쿼리는 LaGuardia 또는 JFK 공항에서 끝나는
        택시 탑승 건수를 자치구별로 합산합니다:

    ```pgsql
    taxi=# SELECT
            count(1) AS total,
            COALESCE(NULLIF(dictGet(
                'taxi.taxi_zone_dictionary', 'Borough',
                toUInt64(pickup_nyct2010_gid)
            ), ''), 'Unknown') AS borough_name
        FROM taxi.trips
        WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
        GROUP BY borough_name
        ORDER BY total DESC;
     total | borough_name
    -------+---------------
     23683 | Unknown
      7053 | Manhattan
      6828 | Brooklyn
      4458 | Queens
      2670 | Bronx
       554 | Staten Island
        53 | EWR
    (7 rows)

    Time: 66.245 ms
    ```

    이 쿼리는 LaGuardia 또는 JFK 공항에서 끝나는 택시 탑승 건수를
    자치구별로 합산합니다. 픽업 지역이 알 수 없는 경우가 상당히
    많다는 점에 주목하십시오.

## 조인 수행하기 \{#perform-a-join\}

`taxi_zone_dictionary`를 `trips` 테이블과 조인하는 몇 가지 쿼리를 작성합니다.

1.  앞에서 본 공항 관련 쿼리와 유사하게 동작하는 간단한 `JOIN`부터 시작합니다:

    ```pgsql
    taxi=# SELECT
        count(1) AS total,
        "Borough"
    FROM taxi.trips
    JOIN taxi.taxi_zone_dictionary
      ON trips.pickup_nyct2010_gid = toUInt64(taxi.taxi_zone_dictionary."LocationID")
    WHERE pickup_nyct2010_gid > 0
      AND dropoff_nyct2010_gid IN (132, 138)
    GROUP BY "Borough"
    ORDER BY total DESC;
     total | borough_name
    -------+---------------
      7053 | Manhattan
      6828 | Brooklyn
      4458 | Queens
      2670 | Bronx
       554 | Staten Island
        53 | EWR
    (6 rows)

    Time: 48.449 ms
    ```

    :::note
    위 `JOIN` 쿼리의 출력은 `Unknown` 값이 포함되지 않은 점을 제외하면 앞의 `dictGet` 쿼리와 동일합니다. 내부적으로 ClickHouse는 `taxi_zone_dictionary` 딕셔너리에 대해 `dictGet` 함수를 호출하지만, `JOIN` 구문이 SQL 개발자에게 더 익숙합니다.
    :::

    ```pgsql
    taxi=# explain SELECT
            count(1) AS total,
            "Borough"
        FROM taxi.trips
        JOIN taxi.taxi_zone_dictionary
          ON trips.pickup_nyct2010_gid = toUInt64(taxi.taxi_zone_dictionary."LocationID")
        WHERE pickup_nyct2010_gid > 0
          AND dropoff_nyct2010_gid IN (132, 138)
        GROUP BY "Borough"
        ORDER BY total DESC;
                                  QUERY PLAN
    -----------------------------------------------------------------------
     Foreign Scan  (cost=1.00..5.10 rows=1000 width=40)
       Relations: Aggregate on ((trips) INNER JOIN (taxi_zone_dictionary))
    (2 rows)
    Time: 2.012 ms
    ```

2.  이 쿼리는 팁 금액이 가장 높은 1,000개의 운행에 대한 행을 반환한 다음, 각 행을 딕셔너리와 내부 조인을 수행합니다:

    ```sql
    taxi=# SELECT *
    FROM taxi.trips
    JOIN taxi.taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi.taxi_zone_dictionary."LocationID"
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000;
    ```

:::note
일반적으로 PostgreSQL과 ClickHouse에서는 `SELECT *` 사용을 피합니다. 실제로 필요한 컬럼만 조회해야 합니다.
:::

[tutorial]: /tutorial "ClickHouse 고급 튜토리얼"

[psql]: https://www.postgresql.org/docs/current/app-psql.html
    "PostgreSQL 클라이언트 애플리케이션: psql"

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html
    "SQL 명령어: EXPLAIN"

[dictionary]: /sql-reference/dictionaries/index.md

[PGXN]: https://pgxn.org/dist/pg_clickhouse "PGXN의 pg_clickhouse"

[GitHub]: https://github.com/ClickHouse/pg_clickhouse/releases
    "GitHub의 pg_clickhouse 릴리스"

[pg_clickhouse image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "GitHub의 pg_clickhouse OCI 이미지"

[Postgres image]: https://hub.docker.com/_/postgres
    "Docker Hub의 Postgres OCI 이미지"

[Refreshing dictionary data using LIFETIME]: /sql-reference/dictionaries/index.md#refreshing-dictionary-data-using-lifetime
    "ClickHouse 문서: LIFETIME을 사용한 딕셔너리 데이터 새로 고침"