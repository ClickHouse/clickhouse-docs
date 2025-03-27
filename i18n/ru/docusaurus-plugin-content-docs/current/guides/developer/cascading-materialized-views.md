---
slug: /guides/developer/cascading-materialized-views
title: 'Каскадные Материализованные Представления'
description: 'Как использовать несколько материализованных представлений из исходной таблицы.'
keywords: ['материализованное представление', 'агрегация']
---


# Каскадные Материализованные Представления

Этот пример демонстрирует, как создать Материализованное Представление, а затем как каскадно создавать второе Материализованное Представление на основе первого. На этой странице вы увидите, как это сделать, многие из возможностей и ограничений. Разные случаи использования могут быть решены путем создания Материализованного представления, используя второе Материализованное представление в качестве источника.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

Пример:

Мы будем использовать фейковый набор данных с числом просмотров в час для группы доменных имен.

Наша Цель

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из этих вариантов:

- Написать запросы, которые будут считывать и агрегировать данные во время запроса SELECT
- Подготовить данные во время приема в новом формате
- Подготовить данные во время приема к конкретной агрегации.

Подготовка данных с использованием Материализованных представлений позволит вам ограничить объем данных и расчетов, которые должен выполнить ClickHouse, что сделает ваши запросы SELECT быстрее.

## Исходная таблица для материализованных представлений {#source-table-for-the-materialized-views}

Создайте исходную таблицу, потому что наши цели связаны с отчетностью по агрегированным данным, а не по отдельным строкам, мы можем разобрать их, передать информацию в Материализованные Представления и отбросить фактические входящие данные. Это соответствует нашим целям и экономит место для хранения, поэтому мы будем использовать движок таблицы `Null`.

```sql
CREATE DATABASE IF NOT EXISTS analytics;
```

```sql
CREATE TABLE analytics.hourly_data
(
    `domain_name` String,
    `event_time` DateTime,
    `count_views` UInt64
)
ENGINE = Null
```

:::note
Вы можете создать материализованное представление на таблице Null. Таким образом, данные, записанные в таблицу, будут влиять на представление, но оригинальные сырьевые данные все равно будут отброшены.
:::

## Таблица и материализованное представление, агрегированные по месяцам {#monthly-aggregated-table-and-materialized-view}

Для первого Материализованного Представления нам нужно создать таблицу `Target`, для этого примера она будет `analytics.monthly_aggregated_data`, и мы будем хранить сумму просмотров по месяцам и доменным именам.

```sql
CREATE TABLE analytics.monthly_aggregated_data
(
    `domain_name` String,
    `month` Date,
    `sumCountViews` AggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (domain_name, month)
```

Материализованное представление, которое будет перенаправлять данные на целевую таблицу, будет выглядеть так:

```sql
CREATE MATERIALIZED VIEW analytics.monthly_aggregated_data_mv
TO analytics.monthly_aggregated_data
AS
SELECT
    toDate(toStartOfMonth(event_time)) AS month,
    domain_name,
    sumState(count_views) AS sumCountViews
FROM analytics.hourly_data
GROUP BY
    domain_name,
    month
```

## Таблица и материализованное представление, агрегированные по годам {#yearly-aggregated-table-and-materialized-view}

Теперь мы создадим второе Материализованное представление, которое будет связано с нашей предыдущей целевой таблицей `monthly_aggregated_data`.

Сначала мы создадим новую целевую таблицу, которая будет хранить сумму просмотров, агрегированных по годам для каждого доменного имени.

```sql
CREATE TABLE analytics.year_aggregated_data
(
    `domain_name` String,
    `year` UInt16,
    `sumCountViews` UInt64
)
ENGINE = SummingMergeTree()
ORDER BY (domain_name, year)
```

Этот шаг определяет каскад. Оператор `FROM` будет использовать таблицу `monthly_aggregated_data`, это означает, что поток данных будет следующим:

1. Данные поступают в таблицу `hourly_data`.
2. ClickHouse перенаправит полученные данные в первую Материализованную таблицу `monthly_aggregated_data`,
3. Наконец, данные, полученные на шаге 2, будут перенаправлены в `year_aggregated_data`.

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
Общее недопонимание при работе с Материализованными представлениями заключается в том, что данные считываются из таблицы. Это не то, как работают `Материализованные представления`; переданные данные - это вставленный блок, а не конечный результат в вашей таблице.

Представьте себе, что в этом примере движок, используемый в `monthly_aggregated_data`, это CollapsingMergeTree. Данные, переданные во второе Материализованное представление `year_aggregated_data_mv`, не будут итоговым результатом свертки таблицы, это будет передаваться блок данных с полями, определенными в `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или даже SummingMergeTree, и собираетесь создать каскадное Материализованное представление, вам нужно понимать ограничения, описанные здесь.
:::

## Пример данных {#sample-data}

Теперь время протестировать наше каскадное материализованное представление, вставив некоторые данные:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

Если вы выполните SELECT содержимого `analytics.hourly_data`, вы увидите следующее, поскольку движок таблицы - `Null`, но данные были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

Мы использовали небольшой набор данных, чтобы быть уверенными, что можем отслеживать и сравнивать результат с тем, что ожидаем, как только ваш поток будет правильным с небольшим набором данных, вы можете просто перейти к большому количеству данных.

## Результаты {#results}

Если вы попробуете выполнить запрос к целевой таблице, выбрав поле `sumCountViews`, вы увидите двоичное представление (в некоторых терминалах), поскольку значение не хранится как число, а как тип AggregateFunction.
Чтобы получить окончательный результат агрегации, вы должны использовать суффикс `-Merge`.

Вы можете увидеть специальные символы, хранящиеся в AggregateFunction с помощью этого запроса:

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

3 rows in set. Elapsed: 0.003 sec.
```

Вместо этого давайте попробуем использовать суффикс `Merge`, чтобы получить значение `sumCountViews`:

```sql
SELECT
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

В `AggregatingMergeTree` мы определили `AggregateFunction` как `sum`, поэтому мы можем использовать `sumMerge`. Когда мы используем функцию `avg` на `AggregateFunction`, мы будем использовать `avgMerge`, и так далее.

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

Теперь мы можем проверить, что Материализованные Представления отвечают цели, которую мы определили.

Теперь, когда мы имеем данные, хранящиеся в целевой таблице `monthly_aggregated_data`, мы можем получить данные, агрегированные по месяцам для каждого доменного имени:

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
   domain_name,
   month
```

```response
┌──────month─┬─domain_name────┬─sumCountViews─┐
│ 2020-01-01 │ clickhouse.com │             6 │
│ 2019-01-01 │ clickhouse.com │             1 │
│ 2019-02-01 │ clickhouse.com │             5 │
└────────────┴────────────────┴───────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

Данные, агрегированные по годам для каждого доменного имени:

```sql
SELECT
   year,
   domain_name,
   sum(sumCountViews)
FROM analytics.year_aggregated_data
GROUP BY
   domain_name,
   year
```

```response
┌─year─┬─domain_name────┬─sum(sumCountViews)─┐
│ 2019 │ clickhouse.com │                  6 │
│ 2020 │ clickhouse.com │                  6 │
└──────┴────────────────┴────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```


## Объединение нескольких исходных таблиц в одну целевую таблицу {#combining-multiple-source-tables-to-single-target-table}

Материализованные представления также могут использоваться для объединения нескольких исходных таблиц в одну и ту же целевую таблицу. Это полезно для создания материализованного представления, которое аналогично логике `UNION ALL`.

Сначала создайте две исходные таблицы, представляющие разные наборы метрик:

```sql
CREATE TABLE analytics.impressions
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;

CREATE TABLE analytics.clicks
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;
```

Затем создайте целевую таблицу с объединенным набором метрик:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

Создайте два материализованных представления, указывающих на одну и ту же целевую таблицу. Вам не нужно явно включать отсутствующие столбцы:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- если вы это пропустите, будет 0
FROM
    analytics.impressions
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;

CREATE MATERIALIZED VIEW analytics.daily_clicks_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS clicks,
    0 impressions    ---<<<--- если вы это пропустите, будет 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь, когда вы вставляете значения, эти значения будут агрегированы в соответствующие столбцы в целевой таблице:

```sql
INSERT INTO analytics.impressions (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-02-01 00:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;

INSERT INTO analytics.clicks (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;
```

Объединенные просмотры и клики в целевой таблице:

```sql
SELECT
    on_date,
    domain_name,
    sum(impressions) AS impressions,
    sum(clicks) AS clicks
FROM
    analytics.daily_overview
GROUP BY
    on_date,
    domain_name
;
```

Этот запрос должен вернуть что-то вроде:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
