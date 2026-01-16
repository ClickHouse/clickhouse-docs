---
sidebar_label: 'Создание случайных тестовых данных'
title: 'Создание случайных тестовых данных в ClickHouse'
slug: /guides/generating-test-data
description: 'Узнайте, как создавать случайные тестовые данные в ClickHouse'
show_related_blogs: true
doc_type: 'guide'
keywords: ['случайные данные', 'тестовые данные']
---

# Генерация случайных тестовых данных в ClickHouse \\{#generating-random-test-data-in-clickhouse\\}

Генерация случайных данных полезна при тестировании новых сценариев использования или бенчмаркинге вашей реализации.
В ClickHouse есть [широкий набор функций для генерации случайных данных](/sql-reference/functions/random-functions), которые во многих случаях устраняют необходимость во внешнем генераторе данных.

В этом руководстве приведено несколько примеров того, как генерировать случайные наборы данных в ClickHouse с разными требованиями к случайности.

## Простой однородный набор данных \\{#simple-uniform-dataset\\}

**Сценарий использования:** Быстрая генерация набора данных пользовательских событий со случайными метками времени и типами событий.

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

* `rand() % 10000`: равномерное распределение по 10 000 пользователям
* `arrayJoin(...)`: случайный выбор одного из трёх типов событий
* Метки времени распределены в пределах последних 24 часов

***

## Экспоненциальное распределение \\{#exponential-distribution\\}

**Вариант использования**: имитация сумм покупок, при которой большинство значений невелики, но некоторые — очень большие.

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

* Равномерные временные метки за недавний период
* `randExponential(1/10)` — большинство суммарных значений около 0, со смещением не менее чем на 15 ([ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4])

***

## События, распределённые во времени (Пуассон) \\{#poisson-distribution\\}

**Сценарий использования**: моделирование поступления событий, сосредоточенных в определённый период (например, в час пик).

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

* Пик числа событий приходится на полдень, отклонения имеют пуассоновское распределение

***

## Нормальное распределение, зависящее от времени \\{#time-varying-normal-distribution\\}

**Сценарий использования**: Имитировать системные метрики (например, загрузку процессора), которые изменяются со временем.

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

* `usage` подчиняется суточной синусоидальной кривой с добавлением случайной компоненты
* Значения ограничены интервалом [0,100]

***

## Категориальные и вложенные данные \\{#categorical-and-nested-data\\}

**Пример использования**: создание пользовательских профилей с несколькими интересами.

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

* Случайная длина массива от 1 до 3
* Три оценки пользователя для каждого интереса

:::tip
Прочитайте запись в блоге [Generating Random Data in ClickHouse](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse) для ещё большего количества примеров.
:::

## Генерация случайных таблиц \\{#generating-random-tables\\}

Функция [`generateRandomStructure`](/sql-reference/functions/other-functions#generateRandomStructure) особенно полезна в сочетании с табличным движком [`generateRandom`](/sql-reference/table-functions/generate) для тестирования, бенчмаркинга или создания тестовых данных с произвольными схемами.

Для начала просто посмотрим, как выглядит случайная структура с помощью функции `generateRandomStructure`:

```sql
SELECT generateRandomStructure(5);
```

Вы можете увидеть примерно следующее:

```response
c1 UInt32, c2 Array(String), c3 DateTime, c4 Nullable(Float64), c5 Map(String, Int16)
```

Вы также можете задать начальное значение (seed), чтобы каждый раз получать одну и ту же структуру:

```sql
SELECT generateRandomStructure(3, 42);
```

```response
c1 String, c2 Array(Nullable(Int32)), c3 Tuple(UInt8, Date)
```

Теперь давайте создадим настоящую таблицу и заполним её случайными данными:

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

Давайте объединим обе функции для полностью случайной таблицы.
Сначала посмотрим, какую структуру мы получим:

```sql
SELECT generateRandomStructure(7, 123) AS structure FORMAT vertical;
```

```response
┌─structure──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal64(7), c2 Enum16('c2V0' = -21744, 'c2V1' = 5380), c3 Int8, c4 UUID, c5 UUID, c6 FixedString(190), c7 Map(Enum16('c7V0' = -19581, 'c7V1' = -10024, 'c7V2' = 27615, 'c7V3' = -10177, 'c7V4' = -19644, 'c7V5' = 3554, 'c7V6' = 29073, 'c7V7' = 28800, 'c7V8' = -11512), Float64) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Теперь создайте таблицу с указанной структурой и используйте оператор `DESCRIBE`, чтобы увидеть, что именно было создано:

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

Просмотрите первую строку как пример сгенерированных данных:

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
