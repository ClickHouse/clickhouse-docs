---
slug: /guides/developer/cascading-materialized-views
title: 'Каскадные материализованные представления'
description: 'Как использовать несколько материализованных представлений из исходной таблицы.'
keywords: ['материализованное представление', 'агрегация']
---


# Каскадные материализованные представления

Этот пример демонстрирует, как создать материализованное представление, а затем как каскадировать второе материализованное представление к первому. На этой странице вы увидите, как это сделать, многие возможности и ограничения. Разные случаи использования могут быть решены, создавая материализованное представление, используя второе материализованное представление в качестве источника.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

Пример:

Мы будем использовать фейковый набор данных с количеством просмотров в час для группы доменных имен.

Наша цель

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из этих вариантов:

- Написать запросы, которые будут считывать и агрегировать данные во время запроса SELECT
- Подготовить данные на этапе приема в новый формат
- Подготовить данные во время приема к определенной агрегации.

Подготовка данных с помощью материализованных представлений позволит вам ограничить объем данных и расчетов, которые необходимо выполнить ClickHouse, ускоряя ваши SELECT запросы.

## Исходная таблица для материализованных представлений {#source-table-for-the-materialized-views}

Создайте исходную таблицу, поскольку наши цели связаны с отчетностью по агрегированным данным, а не по отдельным строкам, мы можем разобрать их, передать информацию в материализованные представления и удалить входящие данные. Это соответствует нашим целям и экономит место, поэтому мы будем использовать движок таблицы `Null`.

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
Вы можете создать материализованное представление на таблице Null. Таким образом, данные, записанные в таблицу, повлияют на представление, но исходные необработанные данные все равно будут отброшены.
:::

## Ежемесячная агрегированная таблица и материализованное представление {#monthly-aggregated-table-and-materialized-view}

Для первого материализованного представления нам нужно создать таблицу `Target`, для этого примера она будет `analytics.monthly_aggregated_data`, и мы будем хранить сумму просмотров по месяцам и доменным именам.

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

Сначала мы создадим новую целевую таблицу, которая будет хранить сумму просмотров, агрегированную по годам для каждого доменного имени.

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
Общее заблуждение при работе с материализованными представлениями заключается в том, что данные считываются из таблицы. Это не так, как работают `материализованные представления`; передаваемые данные — это вставленный блок, а не конечный результат в вашей таблице.

Представьте, что в этом примере движок, используемый в `monthly_aggregated_data`, — это CollapsingMergeTree, данные, переданные во второе материализованное представление `year_aggregated_data_mv`, не будут конечным результатом сложенной таблицы; они будут передавать блок данных с полями, определенными в `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или даже SummingMergeTree и планируете создать каскадное материализованное представление, вам необходимо понимать описанные здесь ограничения.
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

Если вы выполните SELECT содержимого `analytics.hourly_data`, вы увидите следующее, потому что движок таблицы — `Null`, но данные были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

Мы использовали маленький набор данных, чтобы быть уверенными, что можем отслеживать и сравнивать результат с тем, что мы ожидаем; как только ваш поток корректен с маленьким набором данных, вы можете перейти к большому количеству данных.

## Результаты {#results}

Если вы попробуете выполнить запрос к целевой таблице, выбрав поле `sumCountViews`, вы увидите двоичное представление (в некоторых терминалах), так как значение не хранится как число, а как тип AggregateFunction. Для получения окончательного результата агрегации вам следует использовать суффикс `-Merge`.

Вы можете увидеть специальные символы, хранящиеся в AggregateFunction, с помощью следующего запроса:

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

Теперь мы можем проверить, что материализованные представления отвечают нашим целям.

Теперь, когда у нас есть данные, хранящиеся в целевой таблице `monthly_aggregated_data`, мы можем получить данные, агрегированные по месяцам для каждого доменного имени:

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


## Объединение нескольких исходных таблиц в одно целевое представление {#combining-multiple-source-tables-to-single-target-table}

Материализованные представления также могут использоваться для комбинирования нескольких исходных таблиц в одну и ту же целевую таблицу. Это полезно для создания материализованного представления, сходного по логике с `UNION ALL`.

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
    0 clicks         ---<<<--- если вы это пропустите, это будет то же самое 0
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
    0 impressions    ---<<<--- если вы это пропустите, это будет то же самое 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь, когда вы вставляете значения, эти значения будут агрегироваться по соответствующим столбцам в целевой таблице:

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

Объединенные показы и клики вместе в целевой таблице:

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
