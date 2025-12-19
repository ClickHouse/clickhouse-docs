---
sidebar_label: 'Руководство'
description: 'Узнайте, как подключить pg_clickhouse к ClickHouse и выполнять запросы к примерному набору данных поездок на такси в Нью-Йорке.'
slug: '/integrations/pg_clickhouse/tutorial'
title: 'Руководство по pg_clickhouse'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'обёртка внешних данных', 'pg_clickhouse', 'расширение', 'руководство', 'такси']
---

# Руководство по pg_clickhouse {#pg_clickhouse-tutorial}

## Обзор {#overview}

В этом руководстве повторяется [ClickHouse tutorial], но все запросы выполняются через
pg_clickhouse.

## Запустите ClickHouse {#start-clickhouse}

Сначала создайте базу данных ClickHouse, если у вас её ещё нет. Быстрый способ
начать — воспользоваться Docker-образом:

```sh
docker run -d --network host --name clickhouse -p 8123:8123 -p9000:9000 --ulimit nofile=262144:262144 clickhouse
docker exec -it clickhouse clickhouse-client
```


## Создайте таблицу {#create-a-table}

Воспользуемся примером из [ClickHouse tutorial], чтобы создать простую базу данных с датасетом нью‑йоркского такси:

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


## Добавление набора данных {#add-the-data-set}

Затем импортируйте данные:

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

Убедитесь, что к нему можно выполнить запрос, затем выйдите из клиента:

```sql
SELECT count() FROM taxi.trips;
quit
```


### Установите pg&#95;clickhouse {#install-pg_clickhouse}

Соберите и установите pg&#95;clickhouse из [PGXN] или [GitHub]. Или разверните
контейнер Docker, используя образ [pg&#95;clickhouse image], который просто добавляет
pg&#95;clickhouse к Docker-образу [Postgres image]:

```sh
docker run --network host --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18 -U postgres
```


### Подключите pg&#95;clickhouse {#connect-pg_clickhouse}

Теперь подключитесь к Postgres и создайте pg&#95;clickhouse:

```sql
CREATE EXTENSION pg_clickhouse;
```

Создайте внешний сервер, указав имя хоста, порт и базу данных ClickHouse.

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

Здесь мы выбрали бинарный драйвер, который использует бинарный протокол ClickHouse. Вы также можете использовать драйвер «http», который использует HTTP-интерфейс.

Далее сопоставьте пользователя PostgreSQL с пользователем ClickHouse. Самый простой способ сделать это —
просто сопоставить текущего пользователя PostgreSQL с удалённым пользователем на внешнем сервере:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
```

Вы также можете указать параметр `password`.

Теперь добавьте таблицу taxi: просто импортируйте все таблицы из удалённой
базы данных ClickHouse в схему Postgres:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```

Теперь таблица должна быть импортирована. В [psql] выполните `\det+`, чтобы её увидеть:

```pgsql
taxi=# \det+ taxi.*
                                       List of foreign tables
 Schema | Table |  Server  |                        FDW options                        | Description 
--------+-------+----------+-----------------------------------------------------------+-------------
 taxi   | trips | taxi_srv | (database 'taxi', table_name 'trips', engine 'MergeTree') | [null]
(1 row)
```

Готово! Используйте `\d`, чтобы вывести все столбцы:


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

Теперь выполните запрос к таблице:

```pgsql
 SELECT count(*) FROM taxi.trips;
   count  
 ---------
  1999657
 (1 row)
```

Обратите внимание, как быстро был выполнен запрос. pg&#95;clickhouse полностью
передает весь запрос, включая агрегатную функцию `COUNT()`, поэтому он выполняется в ClickHouse и
возвращает в Postgres только одну строку. Используйте [EXPLAIN], чтобы это увидеть:


```pgsql
 EXPLAIN select count(*) from taxi.trips;
                    QUERY PLAN                    
 -------------------------------------------------
  Foreign Scan  (cost=1.00..-0.90 rows=1 width=8)
    Relations: Aggregate on (trips)
 (2 rows)
```

Обратите внимание, что «Foreign Scan» показан в корне плана, что означает, что
весь запрос был целиком передан на исполнение в ClickHouse.


## Анализ данных {#analyze-the-data}

Выполните несколько запросов, чтобы проанализировать данные. Ознакомьтесь со следующими примерами или попробуйте выполнить собственный SQL‑запрос.

* Рассчитайте среднюю сумму чаевых:

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

* Рассчитайте среднюю стоимость на основе количества пассажиров:

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

* Рассчитайте ежедневное количество посадок по районам:

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

* Вычислите продолжительность каждой поездки в минутах, затем сгруппируйте результаты по её продолжительности:

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

* Покажите количество посадок в каждом районе по часам дня:

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

* Выведите поездки в аэропорты LaGuardia или JFK:

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

## Создайте словарь {#create-a-dictionary}

Создайте словарь, связанный с таблицей в вашем сервисе ClickHouse. Таблица и
словарь основаны на CSV-файле, который содержит строку для каждого
района Нью-Йорка.

Районы сопоставляются с названиями пяти боро Нью-Йорка
(Bronx, Brooklyn, Manhattan, Queens и Staten Island), а также аэропорта Newark
(EWR).

Ниже приведен фрагмент используемого CSV-файла в табличном формате. Столбец
`LocationID` в файле сопоставляется со столбцами `pickup_nyct2010_gid` и
`dropoff_nyct2010_gid` в вашей таблице `trips`:

| LocationID | Borough       |  Zone                   | service_zone |
  | ---------: | ------------- | ----------------------- | ------------ |
  |          1 | EWR           | Newark Airport          | EWR          |
  |          2 | Queens        | Jamaica Bay             | Boro Zone    |
  |          3 | Bronx         | Allerton/Pelham Gardens | Boro Zone    |
  |          4 | Manhattan     | Alphabet City           | Yellow Zone  |
  |          5 | Staten Island | Arden Heights           | Boro Zone    |

1.  Находясь по-прежнему в Postgres, используйте функцию `clickhouse_raw_query`, чтобы создать
    словарь ClickHouse с именем `taxi_zone_dictionary` и заполнить
    этот словарь из CSV-файла в S3:

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
    Установка `LIFETIME` в 0 отключает автоматические обновления, чтобы избежать лишнего
    трафика к нашему бакету S3. В других случаях вы можете настроить это
    по-другому. Подробности см. в разделе [Refreshing dictionary data using
    LIFETIME](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).
    :::

    2.  Теперь импортируйте его:
    
    ```sql
    IMPORT FOREIGN SCHEMA taxi LIMIT TO (taxi_zone_dictionary)
    FROM SERVER taxi_srv INTO taxi;
    ```
    
    3.  Убедитесь, что к нему можно выполнять запросы:
    
    ```pgsql
    taxi=# SELECT * FROM taxi.taxi_zone_dictionary limit 3;
     LocationID |  Borough  |                     Zone                      | service_zone 
    ------------+-----------+-----------------------------------------------+--------------
             77 | Brooklyn  | East New York/Pennsylvania Avenue             | Boro Zone
            106 | Brooklyn  | Gowanus                                       | Boro Zone
            103 | Manhattan | Governor's Island/Ellis Island/Liberty Island | Yellow Zone
    (3 rows)
    ```
    
    4.  Отлично. Теперь используйте функцию `dictGet`, чтобы получить
        название боро в запросе. В этом запросе подсчитывается количество поездок
        на такси по боро, которые заканчиваются либо в аэропорту LaGuardia, либо в аэропорту JFK:
    
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

    Этот запрос подсчитывает количество поездок на такси по боро, которые заканчиваются либо
    в аэропорту LaGuardia, либо в аэропорту JFK. Обратите внимание, что существует довольно много поездок,
    у которых район отправления неизвестен.

## Выполнение JOIN {#perform-a-join}

Напишите несколько запросов, которые выполняют `JOIN` таблицы `taxi_zone_dictionary` с таблицей `trips`.

1.  Начните с простого `JOIN`, который работает аналогично предыдущему
    запросу по аэропортам:

    ```sql
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
    Обратите внимание, что результат указанного выше запроса с `JOIN`
    такой же, как у приведённого выше запроса с `dictGet` (за
    исключением того, что значения `Unknown` не включены). Внутренне
    ClickHouse фактически вызывает функцию `dictGet` для словаря
    `taxi_zone_dictionary`, но синтаксис `JOIN` более привычен для
    разработчиков SQL.
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

2.  Этот запрос возвращает строки для 1000 поездок с наибольшей суммой
    чаевых, а затем выполняет внутренний `JOIN` каждой строки со словарём:

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
Как правило, мы избегаем использования `SELECT *` в PostgreSQL и
ClickHouse. Следует извлекать только те столбцы, которые вам действительно
нужны.
:::

[tutorial]: /tutorial "Расширенный учебник по ClickHouse"

[psql]: https://www.postgresql.org/docs/current/app-psql.html
    "PostgreSQL Client Applications: psql"

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html
    "SQL Commands: EXPLAIN"

[dictionary]: /sql-reference/dictionaries/index.md

[PGXN]: https://pgxn.org/dist/pg_clickhouse "pg_clickhouse на PGXN"

[GitHub]: https://github.com/ClickHouse/pg_clickhouse/releases
    "Релизы pg_clickhouse на GitHub"

[pg_clickhouse image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "pg_clickhouse OCI-образ на GitHub"

[Postgres image]: https://hub.docker.com/_/postgres
    "Postgres OCI-образ на Docker Hub"

[Refreshing dictionary data using LIFETIME]: /sql-reference/dictionaries/index.md#refreshing-dictionary-data-using-lifetime
    "Документация ClickHouse: Обновление данных словаря с помощью LIFETIME"