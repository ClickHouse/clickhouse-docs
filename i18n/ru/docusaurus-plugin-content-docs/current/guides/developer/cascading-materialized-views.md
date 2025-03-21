---
slug: /guides/developer/cascading-materialized-views
title: Каскадные материализованные представления
description: Как использовать несколько материализованных представлений из исходной таблицы.
keywords: ['материализованное представление', 'агрегация']
---


# Каскадные материализованные представления

В этом примере демонстрируется, как создать материализованное представление, а затем как каскадировать второе материализованное представление на первое. На этой странице вы увидите, как это сделать, многие возможности и ограничения. Разные случаи использования могут быть решены созданием материализованного представления с использованием второго материализованного представления в качестве источника.

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/QDAJTKZT8y4"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

Пример:

Мы будем использовать фейковый набор данных с количеством просмотров в час для группы доменных имен.

Наша цель

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из этих вариантов:

- Написать запросы, которые будут читать и агрегировать данные во время выполнения запроса SELECT
- Подготовить данные во время их поступления к новому формату
- Подготовить данные во время поступления к конкретной агрегации.

Подготовка данных с использованием материализованных представлений позволит вам ограничить количество данных и вычислений, которые необходимо выполнить ClickHouse, что сделает ваши запросы SELECT быстрее.

## Исходная таблица для материализованных представлений {#source-table-for-the-materialized-views}

Создайте исходную таблицу, так как наши цели связаны с отчетностью по агрегированным данным, а не по отдельным строкам, мы можем разобрать данные, передать информацию в материализованные представления и отбросить фактически поступающие данные. Это соответствует нашим целям и экономит место для хранения, поэтому мы будем использовать движок таблицы `Null`.

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
Вы можете создать материализованное представление на таблице Null. Таким образом, данные, записанные в таблицу, в конечном итоге повлияют на представление, но оригинальные необработанные данные все равно будут отброшены.
:::

## Ежемесячная агрегированная таблица и материализованное представление {#monthly-aggregated-table-and-materialized-view}

Для первого материализованного представления нам нужно создать целевую таблицу, для этого примера она будет `analytics.monthly_aggregated_data`, и мы будем хранить сумму просмотров по месяцам и доменным именам.

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

Материализованное представление, которое будет передавать данные в целевую таблицу, будет выглядеть следующим образом:

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

## Ежегодная агрегированная таблица и материализованное представление {#yearly-aggregated-table-and-materialized-view}

Теперь мы создадим второе материализованное представление, которое будет связано с нашей предыдущей целевой таблицей `monthly_aggregated_data`.

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

Этот шаг определяет каскад. Оператор `FROM` будет использовать таблицу `monthly_aggregated_data`, это значит, что поток данных будет следующим:

1. Данные поступают в таблицу `hourly_data`.
2. ClickHouse передаст полученные данные в первое материализованное представление `monthly_aggregated_data`,
3. Наконец, данные, полученные на шаге 2, будут переданы в `year_aggregated_data`.

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
Общее неверное толкование при работе с материализованными представлениями заключается в том, что данные читает таблица. Это не то, как работают `материализованные представления`; переданные данные — это вставленный блок, а не конечный результат в вашей таблице.

Предположим, в этом примере движок, используемый в `monthly_aggregated_data`, это CollapsingMergeTree, переданные данные в наше второе материализованное представление `year_aggregated_data_mv` не будут конечным результатом свернутой таблицы, это будет блок данных с полями, определенными в `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или даже SummingMergeTree и планируете создать каскадное материализованное представление, вам нужно понять ограничения, описанные здесь.
:::

## Пример данных {#sample-data}

Теперь пришло время протестировать наше каскадное материализованное представление, вставив некоторые данные:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

Если вы выполните запрос на выборку содержимого `analytics.hourly_data`, вы увидите следующее, поскольку движок таблицы — `Null`, но данные были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

Мы использовали небольшой набор данных, чтобы убедиться, что можем следить и сравнивать результаты с тем, что мы ожидаем, когда ваш поток корректен с небольшим набором данных, вы можете просто перейти к большому объему данных.

## Результаты {#results}

Если вы попытаетесь выполнить запрос к целевой таблице, выбрав поле `sumCountViews`, вы увидите двоичное представление (в некоторых терминалах), так как значение не хранится как число, а как тип AggregateFunction.
Чтобы получить конечный результат агрегации, вы должны использовать суффикс `-Merge`.

Вы можете увидеть специальные символы, сохраненные в AggregateFunction, с помощью этого запроса:

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

В `AggregatingMergeTree` мы определили `AggregateFunction` как `sum`, поэтому мы можем использовать `sumMerge`. Когда мы используем функцию `avg` на `AggregateFunction`, мы будем использовать `avgMerge` и так далее.

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

Теперь мы можем проверить, что материализованные представления отвечают нашей цели.

Теперь, когда мы сохранили данные в целевой таблице `monthly_aggregated_data`, мы можем получить данные, агрегированные по месяцам для каждого доменного имени:

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

Материализованные представления также могут использоваться для объединения нескольких исходных таблиц в одну целевую таблицу. Это полезно для создания материализованного представления, которое аналогично логике `UNION ALL`.

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
    0 clicks         ---<<<--- если вы это опустите, это будет 0
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
    0 impressions    ---<<<--- если вы это опустите, это будет 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь, когда вы вставляете значения, эти значения будут агрегироваться в соответствующие столбцы целевой таблицы:

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
