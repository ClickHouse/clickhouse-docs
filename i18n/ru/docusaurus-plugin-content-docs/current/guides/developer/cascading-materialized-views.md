---
slug: /guides/developer/cascading-materialized-views
title: 'Каскадные материализованные представления'
description: 'Как использовать несколько материализованных представлений на основе исходной таблицы.'
keywords: ['materialized view', 'aggregation']
doc_type: 'guide'
---



# Каскадные материализованные представления

Этот пример демонстрирует, как создать материализованное представление, а затем как каскадно добавить ко нему второе. На этой странице вы увидите, как это сделать, какие есть возможности и ограничения. Разные варианты использования могут быть реализованы путем создания материализованного представления, использующего в качестве источника другое материализованное представление.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

Пример:

Мы будем использовать тестовый набор данных с количеством просмотров в час для группы доменных имен.

Наша цель

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из следующих вариантов:

- Писать запросы, которые будут считывать и агрегировать данные во время выполнения SELECT-запроса,
- Подготавливать данные при загрузке к новому формату,
- Подготавливать данные при загрузке к определенной агрегации.

Подготовка данных с использованием материализованных представлений позволит уменьшить объем данных и вычислений, которые ClickHouse должен выполнить, что сделает ваши SELECT-запросы быстрее.



## Исходная таблица для материализованных представлений {#source-table-for-the-materialized-views}

Создайте исходную таблицу. Поскольку наша цель — формирование отчётов на основе агрегированных данных, а не отдельных строк, мы можем разобрать данные, передать информацию в материализованные представления и отбросить фактические входящие данные. Это соответствует нашим целям и экономит дисковое пространство, поэтому мы будем использовать движок таблиц `Null`.

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


## Таблица месячной агрегации и материализованное представление {#monthly-aggregated-table-and-materialized-view}

Для первого материализованного представления необходимо создать целевую таблицу. В данном примере это будет `analytics.monthly_aggregated_data`, в которой мы будем хранить сумму просмотров по месяцам и доменным именам.

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
2. ClickHouse перенаправит полученные данные в первое материализованное представление — таблицу `monthly_aggregated_data`.
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
Распространённое заблуждение при работе с материализованными представлениями заключается в том, что данные читаются из таблицы. Материализованные представления работают не так: перенаправляется вставляемый блок данных, а не финальный результат в таблице.

Представим в этом примере, что движок, используемый в `monthly_aggregated_data`, — это CollapsingMergeTree. Данные, перенаправленные во второе материализованное представление `year_aggregated_data_mv`, не будут финальным результатом свёрнутой таблицы — будет перенаправлен блок данных с полями, определёнными в `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или даже SummingMergeTree и планируете создать каскадное материализованное представление, вам необходимо понимать ограничения, описанные здесь.
:::


## Примеры данных {#sample-data}

Теперь протестируем каскадное материализованное представление, вставив данные:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

Если выполнить SELECT содержимого `analytics.hourly_data`, вы увидите следующее, поскольку движок таблицы — `Null`, но данные были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

Мы использовали небольшой набор данных, чтобы убедиться, что можем отследить и сравнить результат с ожидаемым. Как только ваш процесс будет корректно работать с небольшим набором данных, вы сможете перейти к большим объёмам данных.


## Результаты {#results}

Если вы попытаетесь запросить целевую таблицу, выбрав поле `sumCountViews`, вы увидите двоичное представление (в некоторых терминалах), так как значение хранится не как число, а как тип AggregateFunction.
Чтобы получить итоговый результат агрегации, необходимо использовать суффикс `-Merge`.

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

Теперь мы можем убедиться, что материализованные представления соответствуют поставленной цели.

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

Материализованные представления также можно использовать для объединения нескольких исходных таблиц в одну и ту же целевую таблицу. Это полезно для создания материализованного представления, которое реализует логику, аналогичную `UNION ALL`.

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

Затем создайте таблицу `Target` с объединённым набором метрик:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

Создайте два материализованных представления, указывающих на одну и ту же таблицу `Target`. Нет необходимости явно указывать отсутствующие столбцы:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- если опустить это, оно будет равно 0
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
    0 impressions    ---<<<--- если опустить это, оно будет равно 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь при вставке значений они будут агрегированы в соответствующие столбцы таблицы `Target`:

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

Объединённые показы и клики в таблице `Target`:

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

3 rows in set. Elapsed: 0.018 sec.
```
