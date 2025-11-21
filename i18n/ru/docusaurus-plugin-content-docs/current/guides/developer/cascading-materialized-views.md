---
slug: /guides/developer/cascading-materialized-views
title: 'Каскадные материализованные представления'
description: 'Как использовать несколько материализованных представлений из одной исходной таблицы.'
keywords: ['материализованное представление', 'агрегация']
doc_type: 'guide'
---



# Каскадные материализованные представления

В этом примере показано, как создать материализованное представление, а затем как построить второе материализованное представление поверх первого. На этой странице вы увидите, как это сделать, узнаете о многих возможностях и ограничениях. Различные сценарии можно реализовать, создавая материализованное представление, использующее в качестве источника другое материализованное представление.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

Пример:

Мы будем использовать синтетический набор данных с количеством просмотров в час для группы доменных имён.

Наша цель

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из следующих вариантов:

- Писать запросы, которые будут читать и агрегировать данные во время выполнения запроса SELECT
- Подготавливать данные при приёме к новому формату
- Подготавливать данные при приёме к определённой агрегации.

Подготовка данных с использованием материализованных представлений позволит ограничить объём данных и вычислений, которые ClickHouse должен выполнять, делая ваши запросы SELECT быстрее.



## Исходная таблица для материализованных представлений {#source-table-for-the-materialized-views}

Создайте исходную таблицу. Поскольку наша цель — формирование отчётов по агрегированным данным, а не по отдельным строкам, мы можем разобрать данные, передать информацию в материализованные представления и отбросить фактические входящие данные. Это соответствует нашим целям и экономит дисковое пространство, поэтому мы будем использовать движок таблиц `Null`.

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
Вы можете создать материализованное представление на основе таблицы с движком Null. Таким образом, данные, записываемые в таблицу, будут влиять на представление, но исходные необработанные данные всё равно будут отброшены.
:::


## Таблица с месячной агрегацией и материализованное представление {#monthly-aggregated-table-and-materialized-view}

Для первого материализованного представления необходимо создать целевую таблицу. В данном примере это будет таблица `analytics.monthly_aggregated_data`, в которой мы будем хранить сумму просмотров по месяцам и доменным именам.

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

Материализованное представление, которое будет передавать данные в целевую таблицу, выглядит следующим образом:

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


## Таблица и материализованное представление с годовой агрегацией {#yearly-aggregated-table-and-materialized-view}

Теперь создадим второе материализованное представление, которое будет связано с нашей предыдущей целевой таблицей `monthly_aggregated_data`.

Сначала создадим новую целевую таблицу, которая будет хранить сумму просмотров, агрегированных по годам для каждого доменного имени.

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

Этот шаг определяет каскад. Инструкция `FROM` будет использовать таблицу `monthly_aggregated_data`, что означает следующий поток данных:

1. Данные поступают в таблицу `hourly_data`.
2. ClickHouse перенаправит полученные данные в таблицу первого материализованного представления `monthly_aggregated_data`.
3. Наконец, данные, полученные на шаге 2, будут перенаправлены в `year_aggregated_data`.

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
Распространённое заблуждение при работе с материализованными представлениями заключается в том, что данные читаются из таблицы. Материализованные представления работают не так: перенаправляется вставленный блок данных, а не конечный результат в таблице.

Представим в этом примере, что движок, используемый в `monthly_aggregated_data`, — это CollapsingMergeTree. Данные, перенаправленные во второе материализованное представление `year_aggregated_data_mv`, не будут конечным результатом свёрнутой таблицы — будет перенаправлен блок данных с полями, определёнными в `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или даже SummingMergeTree и планируете создать каскадное материализованное представление, необходимо понимать ограничения, описанные здесь.
:::


## Примеры данных {#sample-data}

Теперь пришло время протестировать наше каскадное материализованное представление, вставив данные:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

Если вы выполните SELECT содержимого `analytics.hourly_data`, вы увидите следующее, поскольку движок таблицы — `Null`, но данные были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

Мы использовали небольшой набор данных, чтобы убедиться, что можем отследить и сравнить результат с ожидаемым. После того как ваш процесс будет корректно работать с небольшим набором данных, вы сможете перейти к работе с большими объемами данных.


## Результаты {#results}

Если вы попытаетесь запросить целевую таблицу, выбрав поле `sumCountViews`, вы увидите двоичное представление (в некоторых терминалах), так как значение хранится не как число, а как тип AggregateFunction.
Чтобы получить итоговый результат агрегации, следует использовать суффикс `-Merge`.

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

Вместо этого попробуем использовать суффикс `Merge` для получения значения `sumCountViews`:

```sql
SELECT
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

В `AggregatingMergeTree` мы определили `AggregateFunction` как `sum`, поэтому можем использовать `sumMerge`. Когда мы используем функцию `avg` для `AggregateFunction`, мы будем использовать `avgMerge`, и так далее.

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

Теперь мы можем убедиться, что материализованные представления решают поставленную задачу.

Теперь, когда данные сохранены в целевой таблице `monthly_aggregated_data`, мы можем получить данные, агрегированные по месяцам для каждого доменного имени:

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) AS sumCountViews
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

Материализованные представления также можно использовать для объединения нескольких исходных таблиц в одну целевую таблицу. Это полезно для создания материализованного представления, работающего аналогично логике `UNION ALL`.

Сначала создайте две исходные таблицы, представляющие различные наборы метрик:

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

Затем создайте целевую таблицу `Target` с объединённым набором метрик:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

Создайте два материализованных представления, указывающих на одну и ту же целевую таблицу `Target`. Отсутствующие столбцы не обязательно указывать явно:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- если опустить это, результат будет тот же — 0
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
    0 impressions    ---<<<--- если опустить это, результат будет тот же — 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь при вставке значений они будут агрегированы в соответствующие столбцы целевой таблицы `Target`:

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

Объединённые показы и клики в целевой таблице `Target`:

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

Этот запрос должен вывести примерно следующее:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 строки в наборе. Затрачено: 0.018 сек.
```
