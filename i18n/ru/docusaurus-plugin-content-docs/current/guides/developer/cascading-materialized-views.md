---
slug: /guides/developer/cascading-materialized-views
title: 'Каскадные материализованные представления'
description: 'Как использовать несколько материализованных представлений для исходной таблицы.'
keywords: ['materialized view', 'агрегация']
doc_type: 'guide'
---



# Каскадные материализованные представления

Этот пример демонстрирует, как создать материализованное представление, а затем — как создать второе материализованное представление на основе первого (каскадно). На этой странице вы увидите, как это сделать, узнаете о многих возможностях и ограничениях. Разные варианты использования можно реализовать, создавая материализованное представление, использующее в качестве источника другое материализованное представление.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

Пример:

Мы будем использовать искусственный набор данных с числом просмотров в час для группы доменных имён.

Наша цель:

1. Нам нужны данные, агрегированные по месяцам для каждого доменного имени,
2. Нам также нужны данные, агрегированные по годам для каждого доменного имени.

Вы можете выбрать один из следующих вариантов:

- Писать запросы, которые будут читать и агрегировать данные во время выполнения запроса SELECT
- Подготавливать данные во время приёма к новому формату
- Подготавливать данные во время приёма к определённой агрегации.

Подготовка данных с помощью материализованных представлений позволит ограничить объём данных и вычислений, которые ClickHouse должен выполнять, что сделает ваши запросы SELECT быстрее.



## Исходная таблица для материализованных представлений

Создайте исходную таблицу. Поскольку наша цель — формировать отчёты по агрегированным данным, а не по отдельным строкам, мы можем разобрать входящие данные, передать информацию в материализованные представления и отбросить сами исходные данные. Это соответствует нашим целям и экономит место в хранилище, поэтому мы будем использовать движок таблицы `Null`.

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
Вы можете создать материализованное представление на таблице Null. Тогда данные, записанные в таблицу, будут влиять на представление, при этом исходные сырые данные всё равно будут отбрасываться.
:::


## Ежемесячная агрегированная таблица и материализованное представление

Для первого материализованного представления нужно создать таблицу `Target`. В этом примере это будет `analytics.monthly_aggregated_data`, где мы будем хранить сумму просмотров по месяцам и доменным именам.

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

Материализованное представление, которое будет передавать данные в целевую таблицу, будет выглядеть так:

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


## Таблица с годовой агрегацией и материализованное представление

Теперь мы создадим второе материализованное представление, которое будет связано с нашей ранее созданной целевой таблицей `monthly_aggregated_data`.

Сначала мы создадим новую целевую таблицу, которая будет хранить суммарное количество просмотров, агрегированное по годам для каждого доменного имени.

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
2. ClickHouse перенаправит полученные данные в первую таблицу материализованного представления — `monthly_aggregated_data`.
3. Наконец, данные, полученные на шаге 2, будут перенаправлены в таблицу `year_aggregated_data`.

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
Распространённое заблуждение при работе с материализованными представлениями (`Materialized views`) состоит в том, что данные читаются из таблицы. На самом деле `Materialized views` работают иначе: пересылаются вставляемые блоки, а не конечный результат в вашей таблице.

Представим, что в этом примере в `monthly_aggregated_data` используется движок CollapsingMergeTree. Тогда данные, пересылаемые во второе материализованное представление `year_aggregated_data_mv`, не будут итоговым результатом уже «схлопнутой» таблицы; будет переслан блок данных с полями, определёнными в запросе `SELECT ... GROUP BY`.

Если вы используете CollapsingMergeTree, ReplacingMergeTree или SummingMergeTree и планируете создать каскад материализованных представлений, вам необходимо понимать описанные здесь ограничения.
:::


## Пример данных

Теперь можно протестировать наше каскадное материализованное представление, вставив некоторые данные:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

Если выполнить SELECT из `analytics.hourly_data`, вы увидите следующее: движок таблицы — `Null`, но данные при этом были обработаны.

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

Получено строк: 0. Время выполнения: 0.002 сек.
```

Мы использовали небольшой набор данных, чтобы убедиться, что можем отслеживать и сравнивать результаты с ожидаемыми. Когда ваш конвейер корректно работает с небольшим набором данных, вы можете перейти к большому объёму данных.


## Результаты

Если вы попытаетесь выполнить запрос к целевой таблице, выбрав поле `sumCountViews`, вы увидите его двоичное представление (в некоторых терминалах), так как значение хранится не как число, а как тип данных AggregateFunction.
Чтобы получить конечный результат агрегации, используйте суффикс `-Merge`.

Вы можете увидеть специальные символы, хранящиеся в AggregateFunction, с помощью этого запроса:

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

Получено 3 строки. Прошло: 0.003 сек.
```

Вместо этого попробуем использовать суффикс `Merge`, чтобы получить значение `sumCountViews`:

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

В `AggregatingMergeTree` мы определили `AggregateFunction` как `sum`, поэтому можем использовать `sumMerge`. Если мы используем функцию `avg` для `AggregateFunction`, то используем `avgMerge` и так далее.

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

Теперь мы можем убедиться, что материализованные представления соответствуют поставленной задаче.

Теперь, когда данные сохранены в целевой таблице `monthly_aggregated_data`, мы можем получить агрегированные по месяцам данные для каждого доменного имени:

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

Агрегированные по годам данные для каждого доменного имени:

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

2 строки в наборе. Затрачено: 0.004 сек.
```


## Объединение нескольких исходных таблиц в одну целевую таблицу

Материализованные представления также можно использовать для объединения нескольких исходных таблиц в одну и ту же целевую таблицу. Это полезно для создания материализованного представления, которое работает аналогично логике `UNION ALL`.

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

Создайте два материализованных представления, ссылающихся на одну и ту же таблицу `Target`. Нет необходимости явно перечислять отсутствующие столбцы:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- если это опустить, результат будет тот же — 0
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
    0 impressions    ---<<<--- если это опустить, результат будет тот же — 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

Теперь при вставке значений они будут агрегироваться в соответствующие столбцы таблицы `Target`:

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

Выбрано 3 строки. Затрачено: 0.018 сек.
```
